require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { openDb, initSchema } = require('../db/setup');

const MODEL = 'claude-opus-4-7';
const MAX_TOKENS = 16000;
const DEFAULT_BATCH = 10;
const CANDIDATES_PER_ARTICLE = 5;

const SYSTEM_PROMPT = `You are a domain name strategist who spots emerging tech trends and invents brandable, ownable domain names that could anchor a startup in that space.

For each article you receive, you will:
1. Identify the core trend or theme (a 2-5 word label).
2. Invent ${CANDIDATES_PER_ARTICLE} candidate domain names that a founder could realistically buy and build on.

Rules for candidates:
- Favor short, pronounceable, invented or blended words (think Notion, Stripe, Figma, Linear, Vercel).
- Avoid trademarked names, generic dictionary phrases, and hyphens/numbers.
- Prefer .com, .ai, .io, or .co. Pick the TLD that best fits the brand.
- Do not propose domains that are obviously already taken by well-known companies.

Score each candidate 1-10 on:
- brandability_score: how distinctive and ownable the name feels as a brand
- memorability_score: how easy it is to say, spell, and recall
- relevance_score: how well it captures the article's trend

For 'reasoning', give one concise sentence explaining the name's angle.`;

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    theme: {
      type: 'string',
      description: 'Short label (2-5 words) for the trend or theme in the article',
    },
    domains: {
      type: 'array',
      description: `Exactly ${CANDIDATES_PER_ARTICLE} brandable domain candidates`,
      items: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: "Full domain, e.g. 'foundry.ai'" },
          tld: { type: 'string', enum: ['com', 'ai', 'io', 'co'] },
          brandability_score: { type: 'integer' },
          memorability_score: { type: 'integer' },
          relevance_score: { type: 'integer' },
          reasoning: { type: 'string' },
        },
        required: [
          'domain',
          'tld',
          'brandability_score',
          'memorability_score',
          'relevance_score',
          'reasoning',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['theme', 'domains'],
  additionalProperties: false,
};

function buildUserContent(article) {
  return `Feed: ${article.feed}
Title: ${article.title}
Published: ${article.pub_date ?? 'unknown'}
Summary: ${article.summary ?? '(no summary)'}`;
}

async function extractForArticle(client, article) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    thinking: { type: 'adaptive' },
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    output_config: {
      format: { type: 'json_schema', schema: OUTPUT_SCHEMA },
    },
    messages: [{ role: 'user', content: buildUserContent(article) }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('No text block in response');
  return JSON.parse(textBlock.text);
}

function saveResults(db, articleId, result) {
  const insertDomain = db.prepare(`
    INSERT OR IGNORE INTO domains (
      article_id, domain, tld, brandability_score,
      memorability_score, relevance_score, reasoning, theme
    ) VALUES (
      @article_id, @domain, @tld, @brandability_score,
      @memorability_score, @relevance_score, @reasoning, @theme
    )
  `);
  const markProcessed = db.prepare(
    `UPDATE articles SET processed_at = datetime('now') WHERE id = ?`,
  );

  const tx = db.transaction(() => {
    for (const d of result.domains) {
      insertDomain.run({
        article_id: articleId,
        domain: d.domain,
        tld: d.tld,
        brandability_score: d.brandability_score,
        memorability_score: d.memorability_score,
        relevance_score: d.relevance_score,
        reasoning: d.reasoning,
        theme: result.theme,
      });
    }
    markProcessed.run(articleId);
  });
  tx();
}

async function processBatch({ batchSize = DEFAULT_BATCH } = {}) {
  const client = new Anthropic();
  const db = openDb();
  initSchema(db);

  const articles = db
    .prepare(
      `SELECT id, feed, title, link, pub_date, summary
       FROM articles
       WHERE processed_at IS NULL
       ORDER BY fetched_at DESC
       LIMIT ?`,
    )
    .all(batchSize);

  if (articles.length === 0) {
    console.log('No unprocessed articles.');
    db.close();
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;

  for (const article of articles) {
    try {
      const result = await extractForArticle(client, article);
      saveResults(db, article.id, result);
      processed += 1;
      console.log(
        `[${article.id}] ${result.theme} — ${result.domains.length} candidates`,
      );
    } catch (err) {
      failed += 1;
      console.error(`[${article.id}] failed: ${err.message}`);
    }
  }

  db.close();
  return { processed, failed };
}

if (require.main === module) {
  const batchArg = Number(process.argv[2]);
  processBatch({ batchSize: Number.isFinite(batchArg) ? batchArg : DEFAULT_BATCH })
    .then((r) => console.log(`Done. processed=${r.processed} failed=${r.failed}`))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { processBatch, extractForArticle };

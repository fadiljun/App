require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { openDb, initSchema } = require('../db/setup');

const MODEL = 'claude-opus-4-7';
const MAX_TOKENS = 8000;

const SYSTEM_PROMPT = `You are a senior brand designer and copywriter. You produce a single-page, self-contained HTML landing page that announces a premium domain name is for sale.

The page must:
- Be one complete HTML document (doctype, head, body).
- Be visually striking: modern typography, generous white space, a subtle gradient or monochrome palette appropriate to the brand.
- Use system fonts or Google Fonts (via CDN link in head).
- Inline all CSS in a <style> tag (no external CSS files).
- Include: the domain as a giant headline, a 1-sentence value proposition aligned with the trend, 3 short bullet points on why the name is valuable, the asking price prominently displayed, and a mailto: "Make an offer" CTA.
- Include a small footer noting the domain is for sale via direct negotiation.
- Be mobile-friendly (responsive).
- Contain no tracking scripts, no analytics, no external JS.
- Never invent testimonials, company names, or fake social proof.
Return ONLY the raw HTML — no markdown fences, no commentary.`;

function buildUserContent({ domain, theme, reasoning, listing_price_usd, contact_email }) {
  return `Domain: ${domain}
Theme / trend this name captures: ${theme}
Why this name is brandable: ${reasoning}
Asking price (USD): $${listing_price_usd.toLocaleString()}
Contact email for offers: ${contact_email}`;
}

async function generateLandingHtml({ domain, theme, reasoning, listing_price_usd, contact_email }) {
  const client = new Anthropic();
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
    messages: [
      {
        role: 'user',
        content: buildUserContent({
          domain,
          theme,
          reasoning,
          listing_price_usd,
          contact_email,
        }),
      },
    ],
  });
  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('No text block in landing-page response');
  return textBlock.text.trim();
}

async function generateAndSave(domainId, contact_email) {
  const db = openDb();
  initSchema(db);
  const row = db
    .prepare(
      `SELECT id, domain, theme, reasoning, listing_price_usd
         FROM domains WHERE id = ?`,
    )
    .get(domainId);
  if (!row) {
    db.close();
    throw new Error(`domain id ${domainId} not found`);
  }
  if (!row.listing_price_usd) {
    db.close();
    throw new Error('listing_price_usd is not set on this domain');
  }
  const html = await generateLandingHtml({
    domain: row.domain,
    theme: row.theme,
    reasoning: row.reasoning,
    listing_price_usd: row.listing_price_usd,
    contact_email,
  });
  db.prepare(`UPDATE domains SET landing_html = ? WHERE id = ?`).run(html, domainId);
  db.close();
  return html;
}

module.exports = { generateLandingHtml, generateAndSave };

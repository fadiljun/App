const Parser = require('rss-parser');
const { openDb, initSchema } = require('../db/setup');

const FEEDS = [
  { name: 'techcrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'theverge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'hackernews', url: 'https://news.ycombinator.com/rss' },
];

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (compatible; AI-Domain-Trend-Hunter/1.0; +https://example.com/bot)',
    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
  },
});

async function fetchFeed(feed) {
  const parsed = await parser.parseURL(feed.url);
  return parsed.items.map((item) => ({
    feed: feed.name,
    title: item.title?.trim() ?? '',
    link: item.link?.trim() ?? '',
    pub_date: item.isoDate ?? item.pubDate ?? null,
    summary: (item.contentSnippet ?? item.content ?? '').trim().slice(0, 4000),
  }));
}

function insertArticles(db, articles) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO articles (feed, title, link, pub_date, summary)
    VALUES (@feed, @title, @link, @pub_date, @summary)
  `);
  const tx = db.transaction((rows) => {
    let inserted = 0;
    for (const row of rows) {
      if (!row.link || !row.title) continue;
      const info = stmt.run(row);
      if (info.changes > 0) inserted += 1;
    }
    return inserted;
  });
  return tx(articles);
}

async function ingestAll() {
  const db = openDb();
  initSchema(db);

  const report = {};
  for (const feed of FEEDS) {
    try {
      const items = await fetchFeed(feed);
      const inserted = insertArticles(db, items);
      report[feed.name] = { fetched: items.length, inserted };
      console.log(`[${feed.name}] fetched=${items.length} inserted=${inserted}`);
    } catch (err) {
      report[feed.name] = { error: err.message };
      console.error(`[${feed.name}] failed:`, err.message);
    }
  }

  db.close();
  return report;
}

if (require.main === module) {
  ingestAll().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { ingestAll, FEEDS };

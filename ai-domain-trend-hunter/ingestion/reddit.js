const { openDb, initSchema } = require('../db/setup');

const SUBREDDITS = [
  'technology',
  'startups',
  'artificial',
  'MachineLearning',
  'programming',
];

const USER_AGENT = 'ai-domain-trend-hunter/1.0 (by /u/anonymous)';
const POST_LIMIT = 25;
const MIN_UPVOTES = 50;

async function fetchSubreddit(name) {
  const url = `https://www.reddit.com/r/${name}/hot.json?limit=${POST_LIMIT}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`reddit ${name} ${res.status}`);
  const json = await res.json();
  const posts = json.data.children.map((c) => c.data);
  return posts
    .filter((p) => !p.stickied && p.score >= MIN_UPVOTES && p.title)
    .map((p) => ({
      feed: `reddit:${name}`,
      title: p.title.trim(),
      link: `https://www.reddit.com${p.permalink}`,
      pub_date: new Date(p.created_utc * 1000).toISOString(),
      summary: (p.selftext || p.url || '').trim().slice(0, 4000),
    }));
}

function insertArticles(db, rows) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO articles (feed, title, link, pub_date, summary)
    VALUES (@feed, @title, @link, @pub_date, @summary)
  `);
  const tx = db.transaction((arr) => {
    let inserted = 0;
    for (const r of arr) {
      if (!r.link || !r.title) continue;
      const info = stmt.run(r);
      if (info.changes > 0) inserted += 1;
    }
    return inserted;
  });
  return tx(rows);
}

async function ingestAll() {
  const db = openDb();
  initSchema(db);
  const report = {};
  for (const sub of SUBREDDITS) {
    try {
      const items = await fetchSubreddit(sub);
      const inserted = insertArticles(db, items);
      report[sub] = { fetched: items.length, inserted };
      console.log(`[reddit:${sub}] fetched=${items.length} inserted=${inserted}`);
    } catch (err) {
      report[sub] = { error: err.message };
      console.error(`[reddit:${sub}] failed:`, err.message);
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

module.exports = { ingestAll, SUBREDDITS };

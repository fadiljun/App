const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'trends.sqlite');

function openDb() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feed TEXT NOT NULL,
      title TEXT NOT NULL,
      link TEXT NOT NULL UNIQUE,
      pub_date TEXT,
      summary TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      processed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_articles_processed ON articles(processed_at);
    CREATE INDEX IF NOT EXISTS idx_articles_feed ON articles(feed);

    CREATE TABLE IF NOT EXISTS domains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      domain TEXT NOT NULL,
      tld TEXT NOT NULL,
      brandability_score INTEGER NOT NULL,
      memorability_score INTEGER NOT NULL,
      relevance_score INTEGER NOT NULL,
      reasoning TEXT,
      theme TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      available INTEGER,
      availability_error TEXT,
      availability_checked_at TEXT,
      UNIQUE(article_id, domain)
    );

    CREATE INDEX IF NOT EXISTS idx_domains_score ON domains(brandability_score DESC);
    CREATE INDEX IF NOT EXISTS idx_domains_theme ON domains(theme);
  `);

  const existing = new Set(
    db.prepare(`PRAGMA table_info(domains)`).all().map((c) => c.name),
  );
  const migrations = [
    ['available', 'INTEGER'],
    ['availability_error', 'TEXT'],
    ['availability_checked_at', 'TEXT'],
  ];
  for (const [col, type] of migrations) {
    if (!existing.has(col)) {
      db.exec(`ALTER TABLE domains ADD COLUMN ${col} ${type}`);
    }
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_domains_available ON domains(available)`);
}

if (require.main === module) {
  const db = openDb();
  initSchema(db);
  console.log(`Schema initialized at ${DB_PATH}`);
  db.close();
}

module.exports = { openDb, initSchema, DB_PATH };

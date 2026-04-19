require('dotenv').config();
const path = require('path');
const express = require('express');
const { openDb, initSchema } = require('../db/setup');

const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/domains', (_req, res) => {
  const db = openDb();
  initSchema(db);
  const rows = db
    .prepare(
      `SELECT d.id, d.domain, d.tld, d.theme,
              d.brandability_score AS brand,
              d.memorability_score AS memo,
              d.relevance_score    AS relevance,
              d.reasoning,
              d.available,
              d.availability_checked_at,
              a.id    AS article_id,
              a.title AS article_title,
              a.feed  AS article_feed,
              a.link  AS article_link,
              a.pub_date
         FROM domains d
         JOIN articles a ON a.id = d.article_id
        ORDER BY (d.brandability_score + d.memorability_score + d.relevance_score) DESC,
                 d.brandability_score DESC`,
    )
    .all();
  const stats = db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN available = 1 THEN 1 ELSE 0 END) AS available_count,
         SUM(CASE WHEN available = 0 THEN 1 ELSE 0 END) AS taken_count,
         SUM(CASE WHEN available IS NULL THEN 1 ELSE 0 END) AS unknown_count,
         COUNT(DISTINCT theme) AS theme_count
       FROM domains`,
    )
    .get();
  db.close();
  res.json({ stats, domains: rows });
});

app.listen(PORT, () => {
  console.log(`Domain Trend Hunter UI running at http://localhost:${PORT}`);
});

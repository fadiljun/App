require('dotenv').config();
const path = require('path');
const express = require('express');
const { openDb, initSchema } = require('../db/setup');
const { cartUrl } = require('../processing/porkbun');
const { generateAndSave } = require('../processing/landing');

const PORT = Number(process.env.PORT) || 3000;
const BUY_MIN_SCORE = Number(process.env.BUY_MIN_SCORE) || 27;
const BUY_ALLOWED_TLDS = (process.env.BUY_ALLOWED_TLDS || 'com,io')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const LISTING_MARKUP = Number(process.env.LISTING_MARKUP) || 10;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'offers@example.com';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function domainRow(row) {
  const total = row.brand + row.memo + row.relevance;
  return {
    ...row,
    total,
    buy_url: cartUrl(row.domain),
  };
}

app.get('/api/config', (_req, res) => {
  res.json({
    buy_min_score: BUY_MIN_SCORE,
    buy_allowed_tlds: BUY_ALLOWED_TLDS,
    listing_markup: LISTING_MARKUP,
  });
});

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
              d.price_usd,
              d.is_premium,
              d.availability_checked_at,
              d.purchased_at,
              d.listing_price_usd,
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
         SUM(CASE WHEN purchased_at IS NOT NULL THEN 1 ELSE 0 END) AS purchased_count,
         COUNT(DISTINCT theme) AS theme_count
       FROM domains`,
    )
    .get();
  db.close();
  res.json({ stats, domains: rows.map(domainRow) });
});

app.get('/api/approval-queue', (_req, res) => {
  const db = openDb();
  initSchema(db);
  const tldPlaceholders = BUY_ALLOWED_TLDS.map(() => '?').join(',');
  const rows = db
    .prepare(
      `SELECT d.id, d.domain, d.tld, d.theme,
              d.brandability_score AS brand,
              d.memorability_score AS memo,
              d.relevance_score    AS relevance,
              d.reasoning,
              d.price_usd,
              d.is_premium,
              a.title AS article_title,
              a.link  AS article_link
         FROM domains d
         JOIN articles a ON a.id = d.article_id
        WHERE d.available = 1
          AND d.purchased_at IS NULL
          AND d.is_premium = 0
          AND d.tld IN (${tldPlaceholders})
          AND (d.brandability_score + d.memorability_score + d.relevance_score) >= ?
        ORDER BY (d.brandability_score + d.memorability_score + d.relevance_score) DESC,
                 d.price_usd ASC`,
    )
    .all(...BUY_ALLOWED_TLDS, BUY_MIN_SCORE);
  db.close();
  res.json({ queue: rows.map(domainRow) });
});

app.post('/api/mark-purchased/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'bad id' });
  const db = openDb();
  initSchema(db);
  const row = db
    .prepare(
      `SELECT id, domain, theme, reasoning, price_usd FROM domains WHERE id = ?`,
    )
    .get(id);
  if (!row) {
    db.close();
    return res.status(404).json({ error: 'not found' });
  }

  const priceUsd = Number(req.body?.price_usd ?? row.price_usd);
  const listingUsd = Number(
    req.body?.listing_price_usd ?? (priceUsd ? priceUsd * LISTING_MARKUP : 0),
  );

  db.prepare(
    `UPDATE domains
        SET purchased_at = datetime('now'),
            price_usd = ?,
            listing_price_usd = ?
      WHERE id = ?`,
  ).run(priceUsd || null, listingUsd || null, id);
  db.close();

  let landingGenerated = false;
  let landingError = null;
  try {
    if (listingUsd) {
      await generateAndSave(id, CONTACT_EMAIL);
      landingGenerated = true;
    }
  } catch (err) {
    landingError = err.message;
  }

  res.json({
    ok: true,
    id,
    domain: row.domain,
    price_usd: priceUsd || null,
    listing_price_usd: listingUsd || null,
    landing_generated: landingGenerated,
    landing_error: landingError,
  });
});

app.post('/api/regenerate-landing/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'bad id' });
  try {
    await generateAndSave(id, CONTACT_EMAIL);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/sale/:domain', (req, res) => {
  const db = openDb();
  initSchema(db);
  const row = db
    .prepare(
      `SELECT landing_html FROM domains
        WHERE domain = ? AND landing_html IS NOT NULL
        ORDER BY purchased_at DESC LIMIT 1`,
    )
    .get(req.params.domain.toLowerCase());
  db.close();
  if (!row) return res.status(404).send('No landing page for this domain.');
  res.type('html').send(row.landing_html);
});

app.listen(PORT, () => {
  console.log(`Domain Trend Hunter UI running at http://localhost:${PORT}`);
});

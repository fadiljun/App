const { openDb, initSchema } = require('../db/setup');
const { checkDomain } = require('./porkbun');

const DELAY_BETWEEN_REQUESTS_MS = 500;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function checkAvailability({ limit = 25, recheck = false } = {}) {
  const db = openDb();
  initSchema(db);

  const query = recheck
    ? `SELECT id, domain FROM domains WHERE purchased_at IS NULL ORDER BY id LIMIT ?`
    : `SELECT id, domain FROM domains
         WHERE availability_checked_at IS NULL AND purchased_at IS NULL
         ORDER BY id LIMIT ?`;
  const rows = db.prepare(query).all(limit);

  if (rows.length === 0) {
    console.log('[availability] nothing to check');
    db.close();
    return { checked: 0, available: 0, taken: 0, errors: 0 };
  }

  const update = db.prepare(`
    UPDATE domains
       SET available = @available,
           price_usd = @price_usd,
           is_premium = @is_premium,
           availability_source = 'porkbun',
           availability_error = @error,
           availability_checked_at = datetime('now')
     WHERE id = @id
  `);

  let available = 0;
  let taken = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const r = await checkDomain(row.domain);
      update.run({
        id: row.id,
        available: r.available ? 1 : 0,
        price_usd: r.price_usd,
        is_premium: r.is_premium ? 1 : 0,
        error: null,
      });
      if (r.available) available += 1;
      else taken += 1;
      const price = r.price_usd != null ? `$${r.price_usd.toFixed(2)}` : 'n/a';
      const tag = r.is_premium ? ' PREMIUM' : '';
      console.log(
        `${row.domain.padEnd(24)} ${r.available ? 'AVAILABLE' : 'taken'} ${price}${tag}`,
      );
    } catch (err) {
      errors += 1;
      update.run({
        id: row.id,
        available: null,
        price_usd: null,
        is_premium: null,
        error: err.message,
      });
      console.log(`${row.domain.padEnd(24)} error: ${err.message}`);
    }
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }

  db.close();
  return { checked: rows.length, available, taken, errors };
}

if (require.main === module) {
  const limitArg = Number(process.argv[2]);
  const recheck = process.argv.includes('--recheck');
  checkAvailability({
    limit: Number.isFinite(limitArg) ? limitArg : 25,
    recheck,
  })
    .then((r) =>
      console.log(
        `Done. checked=${r.checked} available=${r.available} taken=${r.taken} errors=${r.errors}`,
      ),
    )
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { checkAvailability };

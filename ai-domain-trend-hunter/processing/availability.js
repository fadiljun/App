const { openDb, initSchema } = require('../db/setup');

const RDAP_ENDPOINTS = {
  com: 'https://rdap.verisign.com/com/v1',
  ai: 'https://rdap.nic.ai',
  io: 'https://rdap.identitydigital.services/rdap',
  co: 'https://rdap.nic.co',
};

const REQUEST_TIMEOUT_MS = 10000;
const DELAY_BETWEEN_REQUESTS_MS = 1000;
const MAX_RETRIES_ON_429 = 3;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function rdapLookup(domain) {
  const tld = domain.split('.').pop().toLowerCase();
  const base = RDAP_ENDPOINTS[tld];
  if (!base) throw new Error(`No RDAP endpoint for .${tld}`);
  const url = `${base}/domain/${encodeURIComponent(domain.toLowerCase())}`;

  for (let attempt = 0; attempt <= MAX_RETRIES_ON_429; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let res;
    try {
      res = await fetch(url, {
        headers: { Accept: 'application/rdap+json' },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (res.status === 404) return { available: true };
    if (res.status === 200) return { available: false };
    if (res.status === 429 && attempt < MAX_RETRIES_ON_429) {
      const wait = 2000 * Math.pow(2, attempt);
      await sleep(wait);
      continue;
    }
    throw new Error(`RDAP ${tld} ${res.status}`);
  }
  throw new Error('rate limited');
}

async function checkAvailability({ limit = 25, recheck = false } = {}) {
  const db = openDb();
  initSchema(db);

  const query = recheck
    ? `SELECT id, domain FROM domains ORDER BY id LIMIT ?`
    : `SELECT id, domain FROM domains WHERE availability_checked_at IS NULL ORDER BY id LIMIT ?`;
  const rows = db.prepare(query).all(limit);

  if (rows.length === 0) {
    console.log('No domains to check.');
    db.close();
    return { checked: 0, available: 0, taken: 0, errors: 0 };
  }

  const update = db.prepare(`
    UPDATE domains
    SET available = @available,
        availability_error = @error,
        availability_checked_at = datetime('now')
    WHERE id = @id
  `);

  let available = 0;
  let taken = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const result = await rdapLookup(row.domain);
      update.run({
        id: row.id,
        available: result.available ? 1 : 0,
        error: null,
      });
      if (result.available) available += 1;
      else taken += 1;
      console.log(`${row.domain.padEnd(24)} ${result.available ? 'AVAILABLE' : 'taken'}`);
    } catch (err) {
      errors += 1;
      update.run({ id: row.id, available: null, error: err.message });
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

module.exports = { checkAvailability, rdapLookup };

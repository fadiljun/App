require('dotenv').config();
const cron = require('node-cron');

const { ingestAll: ingestRss } = require('./ingestion/rss');
const { ingestAll: ingestReddit } = require('./ingestion/reddit');
const { processBatch } = require('./processing/extractor');
const { checkAvailability } = require('./processing/availability');

const CRON_EXPR = process.env.SCHEDULER_CRON || '*/30 * * * *';
const EXTRACTOR_BATCH = Number(process.env.EXTRACTOR_BATCH_SIZE) || 10;
const AVAILABILITY_BATCH = Number(process.env.AVAILABILITY_BATCH_SIZE) || 25;

let running = false;

async function safe(label, fn) {
  try {
    await fn();
  } catch (err) {
    console.error(`[scheduler] ${label} failed:`, err.message);
  }
}

async function runCycle() {
  if (running) {
    console.log('[scheduler] previous cycle still running, skipping this tick');
    return;
  }
  running = true;
  const start = Date.now();
  console.log(`\n[scheduler] cycle start ${new Date().toISOString()}`);

  await safe('rss', () => ingestRss());
  await safe('reddit', () => ingestReddit());
  await safe('extract', async () => {
    const r = await processBatch({ batchSize: EXTRACTOR_BATCH });
    console.log(`[scheduler] extract processed=${r.processed} failed=${r.failed}`);
  });
  await safe('availability', async () => {
    const a = await checkAvailability({ limit: AVAILABILITY_BATCH });
    console.log(
      `[scheduler] availability checked=${a.checked} avail=${a.available} taken=${a.taken} errors=${a.errors}`,
    );
  });

  running = false;
  const took = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[scheduler] cycle done in ${took}s`);
}

if (require.main === module) {
  console.log(`[scheduler] starting with cron "${CRON_EXPR}"`);
  cron.schedule(CRON_EXPR, runCycle);
  runCycle();
}

module.exports = { runCycle };

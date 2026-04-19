const { openDb, initSchema } = require('../db/setup');

const SAMPLE_ARTICLES = [
  {
    feed: 'sample',
    title: 'Startups race to build AI agents that browse the web autonomously',
    link: 'https://example.com/sample/ai-browser-agents',
    pub_date: '2026-04-15T12:00:00Z',
    summary:
      'A new wave of startups is shipping AI agents that can independently navigate websites, fill forms, and complete multi-step tasks on behalf of users. Investors are pouring capital into "agentic browsers" that blend LLMs with headless Chrome, arguing they will replace SaaS dashboards for routine work.',
  },
  {
    feed: 'sample',
    title: 'Synthetic biology labs go fully autonomous with robotic scientists',
    link: 'https://example.com/sample/self-driving-labs',
    pub_date: '2026-04-14T09:30:00Z',
    summary:
      'So-called self-driving labs pair liquid-handling robots with reinforcement-learning planners to run thousands of biology experiments per day without a human in the loop. Early customers include biotech startups compressing drug discovery timelines from years to months.',
  },
  {
    feed: 'sample',
    title: 'On-device small language models are quietly eating the cloud',
    link: 'https://example.com/sample/on-device-slms',
    pub_date: '2026-04-13T16:45:00Z',
    summary:
      'Small, distilled language models running directly on phones and laptops are replacing API calls for autocomplete, summarization, and transcription. Developers cite privacy, latency, and zero per-token cost as the main drivers, with hardware vendors now shipping dedicated NPUs tuned for 2-7B models.',
  },
  {
    feed: 'sample',
    title: 'Voice-first AI coworkers book meetings and negotiate contracts',
    link: 'https://example.com/sample/voice-ai-coworkers',
    pub_date: '2026-04-12T11:00:00Z',
    summary:
      'A crop of startups is shipping voice-native AI assistants that sit on phone calls, negotiate with vendors, reschedule meetings, and follow up over email. Unlike text chatbots, these agents are designed to act as persistent coworkers across voice, calendar, and CRM.',
  },
  {
    feed: 'sample',
    title: 'Climate-tech founders embrace carbon-aware compute scheduling',
    link: 'https://example.com/sample/carbon-aware-compute',
    pub_date: '2026-04-11T08:15:00Z',
    summary:
      'A new category of infrastructure tools automatically shifts training jobs and batch workloads to regions and hours where the grid is greenest. Early adopters include AI labs trying to cut the carbon footprint of frontier-model training without slowing research.',
  },
];

function seed() {
  const db = openDb();
  initSchema(db);
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO articles (feed, title, link, pub_date, summary)
    VALUES (@feed, @title, @link, @pub_date, @summary)
  `);
  let inserted = 0;
  for (const a of SAMPLE_ARTICLES) {
    const info = stmt.run(a);
    if (info.changes > 0) inserted += 1;
  }
  console.log(`Seeded ${inserted} sample articles (of ${SAMPLE_ARTICLES.length}).`);
  db.close();
}

if (require.main === module) seed();
module.exports = { seed, SAMPLE_ARTICLES };

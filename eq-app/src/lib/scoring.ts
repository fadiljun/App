import type {
  Answers,
  Pillar,
  PillarScores,
  ScoreResult,
} from './types';

const PILLAR_QUESTIONS: Record<Pillar, { ids: number[]; max: number }> = {
  selfAwareness: { ids: [1, 2, 3, 4, 5, 6], max: 60 },
  selfRegulation: { ids: [7, 8, 9, 10, 11, 12], max: 60 },
  empathy: { ids: [13, 14, 15, 16, 17, 18, 19, 20], max: 80 },
  socialSkills: { ids: [21, 22, 23, 24, 25, 26], max: 60 },
  motivation: { ids: [27, 28, 29, 30], max: 40 },
};

const WEIGHTS: Record<Pillar, number> = {
  selfAwareness: 0.20,
  selfRegulation: 0.20,
  empathy: 0.25,
  socialSkills: 0.20,
  motivation: 0.15,
};

// Approximate normal CDF — used to map an EQ score (centered on 100, sd ~15)
// to a percentile for display. Not statistically rigorous; fine for "you scored
// higher than X% of test-takers" copy.
function normalCdf(z: number): number {
  // Abramowitz & Stegun approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-(z * z) / 2);
  const p =
    d *
    t *
    (0.319381530 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - p : p;
}

function calculatePercentile(eqScore: number): number {
  const z = (eqScore - 100) / 15;
  const pct = normalCdf(z) * 100;
  // Clamp to [1, 99] so we never claim "top 0%" or "top 100%".
  return Math.max(1, Math.min(99, Math.round(pct)));
}

function bandFor(score: number): ScoreResult['band'] {
  if (score >= 130) return 'exceptional';
  if (score >= 110) return 'high';
  if (score >= 90) return 'average';
  return 'developing';
}

export function scoreQuiz(answers: Answers): ScoreResult {
  const pillarScores = {} as PillarScores;

  (Object.keys(PILLAR_QUESTIONS) as Pillar[]).forEach((pillar) => {
    const { ids, max } = PILLAR_QUESTIONS[pillar];
    const total = ids.reduce((sum, id) => sum + (answers[id] ?? 0), 0);
    pillarScores[pillar] = Math.round((total / max) * 100);
  });

  const weighted = (Object.keys(WEIGHTS) as Pillar[]).reduce(
    (sum, p) => sum + pillarScores[p] * WEIGHTS[p],
    0,
  );

  // Map the 0–100 weighted composite onto 70–160, mirroring IQ feel.
  const eqScore = Math.round(70 + (weighted / 100) * 90);
  const percentile = calculatePercentile(eqScore);

  const sortedPillars = (Object.keys(pillarScores) as Pillar[]).sort(
    (a, b) => pillarScores[b] - pillarScores[a],
  );

  return {
    pillarScores,
    eqScore,
    percentile,
    band: bandFor(eqScore),
    dominantPillar: sortedPillars[0],
    weakestPillar: sortedPillars[sortedPillars.length - 1],
  };
}

export const PILLAR_LABEL: Record<Pillar, string> = {
  selfAwareness: 'Self-awareness',
  selfRegulation: 'Self-regulation',
  empathy: 'Empathy',
  socialSkills: 'Social skills',
  motivation: 'Motivation',
};

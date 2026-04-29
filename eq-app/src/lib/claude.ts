import type { AIProfile, Onboarding, ScoreResult, Answers } from './types';
import { QUESTIONS } from '../data/questions';
import { PILLAR_LABEL } from './scoring';

// You have two paths to call Claude from the app:
//
// 1) Recommended: route through your own proxy (Cloudflare Worker, etc.)
//    that holds the API key server-side. Set EXPO_PUBLIC_CLAUDE_PROXY_URL.
//    The proxy should accept { prompt, system } and forward to the
//    Anthropic Messages API.
//
// 2) Dev only: bundle a key with EXPO_PUBLIC_CLAUDE_API_KEY. This puts your
//    key into the shipped app — anyone can extract it. Don't ship this way.
const PROXY_URL = process.env.EXPO_PUBLIC_CLAUDE_PROXY_URL;
const API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;

const SYSTEM_PROMPT = `You are a master emotional intelligence analyst with deep training in psychology, attachment theory, and modern EQ research. You write like a brilliant therapist who pays close attention — warm, specific, slightly uncanny. Never generic. Never corporate.

TONE RULES:
- Sound like a great therapist, not a horoscope.
- Be specific. Avoid "you sometimes" and "you tend to" — say "when X happens, you Y".
- Don't flatter. Earn the warmth.
- The blind spot should make them go "...damn".
- The superpower should make them go "wait, really?".
- Never use the words: journey, authentic, embrace, lean into, holistic.

OUTPUT FORMAT:
You MUST respond with a single valid JSON object and nothing else — no preamble, no markdown fences, no commentary. The shape is:

{
  "archetype": string,        // 2–3 word poetic name, specific to their pattern
  "overview": string,         // 2 sentences that make them feel personally seen
  "pillars": {
    "selfAwareness":  string, // 2 sentences on what this score reveals in real life
    "selfRegulation": string,
    "empathy":        string,
    "socialSkills":   string,
    "motivation":     string
  },
  "superpower": string,       // their #1 hidden strength — flattering and specific
  "blindSpot":  string,       // their #1 blind spot — honest but compassionate, never cruel
  "inConflict": string,       // 1 paragraph on how they show up in conflict (gift + cost)
  "inLove":     string,       // 1 paragraph on their pattern in close relationships
  "atWork":     string,       // 1 paragraph on their professional pattern
  "growthChallenge": {
    "focus":     string,      // their lowest-scoring pillar
    "duration":  "7 days",
    "practices": [string, string, string]
  },
  "mantra": string            // one sentence — not cheesy, earned
}`;

const GENDER_LABEL: Record<Onboarding['gender'], string> = {
  female: 'female',
  male: 'male',
  nonbinary: 'non-binary',
  prefer_not_to_say: 'prefers not to say',
};

const MOTIVATION_LABEL: Record<Onboarding['motivation'], string> = {
  self_growth: 'wants to grow personally',
  relationships: 'is working on relationships',
  career: 'is focused on career impact',
  curiosity: 'is curious about themselves',
};

function extractAnswerPatterns(answers: Answers): string {
  // Surface their actual chosen-answer text for each question so the model
  // gets to see qualitative patterns, not just aggregate scores.
  return QUESTIONS.slice(0, 30)
    .map((q) => {
      const v = answers[q.id];
      const choice = q.choices.find((c) => c.value === v);
      return choice ? `Q${q.id} (${q.pillar}): "${choice.label}"` : null;
    })
    .filter(Boolean)
    .join('\n');
}

function buildUserPrompt(
  onboarding: Onboarding,
  answers: Answers,
  scores: ScoreResult,
): string {
  const motivationText = MOTIVATION_LABEL[onboarding.motivation];
  return `USER CONTEXT:
- Age: ${onboarding.age}
- Gender: ${GENDER_LABEL[onboarding.gender]}
- Why they took the test: ${motivationText}

SCORES:
- ${PILLAR_LABEL.selfAwareness}: ${scores.pillarScores.selfAwareness}/100
- ${PILLAR_LABEL.selfRegulation}: ${scores.pillarScores.selfRegulation}/100
- ${PILLAR_LABEL.empathy}: ${scores.pillarScores.empathy}/100
- ${PILLAR_LABEL.socialSkills}: ${scores.pillarScores.socialSkills}/100
- ${PILLAR_LABEL.motivation}: ${scores.pillarScores.motivation}/100
- Composite EQ: ${scores.eqScore}
- Percentile: top ${100 - scores.percentile}% (scored higher than ${scores.percentile}% of test-takers)
- Dominant pillar: ${PILLAR_LABEL[scores.dominantPillar]}
- Weakest pillar: ${PILLAR_LABEL[scores.weakestPillar]}

NOTABLE ANSWER PATTERNS:
${extractAnswerPatterns(answers)}

Generate the full JSON profile now. The growthChallenge.focus must be "${PILLAR_LABEL[scores.weakestPillar]}".`;
}

interface MessagesResponse {
  content: Array<{ type: string; text?: string }>;
}

async function callClaude(prompt: string): Promise<string> {
  const body = {
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  };

  if (PROXY_URL) {
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Proxy returned ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as MessagesResponse;
    return data.content.find((b) => b.type === 'text')?.text ?? '';
  }

  if (!API_KEY) {
    throw new Error(
      'No Claude proxy or API key configured. Set EXPO_PUBLIC_CLAUDE_PROXY_URL or EXPO_PUBLIC_CLAUDE_API_KEY.',
    );
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as MessagesResponse;
  return data.content.find((b) => b.type === 'text')?.text ?? '';
}

function parseProfile(raw: string): AIProfile {
  // The model occasionally wraps JSON in fences despite instructions; strip them.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  const parsed = JSON.parse(cleaned) as AIProfile;
  return parsed;
}

export async function generateProfile(
  onboarding: Onboarding,
  answers: Answers,
  scores: ScoreResult,
): Promise<AIProfile> {
  const prompt = buildUserPrompt(onboarding, answers, scores);
  const raw = await callClaude(prompt);
  return parseProfile(raw);
}

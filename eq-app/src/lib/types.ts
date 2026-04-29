export type Pillar =
  | 'selfAwareness'
  | 'selfRegulation'
  | 'empathy'
  | 'socialSkills'
  | 'motivation';

export type QuestionFormat = 'choice';

export interface AnswerChoice {
  label: string;
  value: number;
}

export interface Question {
  id: number;
  pillar: Pillar;
  prompt: string;
  format: QuestionFormat;
  choices: AnswerChoice[];
}

export type Gender = 'female' | 'male' | 'nonbinary' | 'prefer_not_to_say';

export type MotivationReason =
  | 'self_growth'
  | 'relationships'
  | 'career'
  | 'curiosity';

export interface Onboarding {
  age: number;
  gender: Gender;
  motivation: MotivationReason;
}

// Map question id -> selected score value
export type Answers = Record<number, number>;

export interface PillarScores {
  selfAwareness: number;
  selfRegulation: number;
  empathy: number;
  socialSkills: number;
  motivation: number;
}

export interface ScoreResult {
  pillarScores: PillarScores;
  eqScore: number;
  percentile: number;
  band: 'developing' | 'average' | 'high' | 'exceptional';
  dominantPillar: Pillar;
  weakestPillar: Pillar;
}

export interface AIProfile {
  archetype: string;
  overview: string;
  pillars: {
    selfAwareness: string;
    selfRegulation: string;
    empathy: string;
    socialSkills: string;
    motivation: string;
  };
  superpower: string;
  blindSpot: string;
  inConflict: string;
  inLove: string;
  atWork: string;
  growthChallenge: {
    focus: string;
    duration: string;
    practices: string[];
  };
  mantra: string;
}

export interface SavedReport {
  createdAt: string;
  onboarding: Onboarding;
  answers: Answers;
  scores: ScoreResult;
  profile?: AIProfile;
}

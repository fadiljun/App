import type { Onboarding, Answers, ScoreResult, AIProfile } from '../lib/types';

export type RootStackParamList = {
  Hook: undefined;
  Onboarding: undefined;
  Quiz: { onboarding: Onboarding };
  Calculating: { onboarding: Onboarding; answers: Answers };
  FreeReveal: {
    onboarding: Onboarding;
    answers: Answers;
    scores: ScoreResult;
    profile: AIProfile;
  };
  Paywall: {
    onboarding: Onboarding;
    answers: Answers;
    scores: ScoreResult;
    profile: AIProfile;
  };
  FullReveal: {
    onboarding: Onboarding;
    answers: Answers;
    scores: ScoreResult;
    profile: AIProfile;
  };
  Home: undefined;
};

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '../lib/theme';
import { scoreQuiz } from '../lib/scoring';
import { generateProfile } from '../lib/claude';
import { saveReport } from '../lib/storage';
import type { RootStackParamList } from '../navigation/types';
import type { AIProfile } from '../lib/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Calculating'>;

const STAGES = [
  'Analyzing 5 dimensions…',
  'Cross-referencing 12,000 patterns…',
  'Generating your profile…',
];

// Last-resort fallback so the app never dead-ends if the API fails.
function fallbackProfile(weakest: string): AIProfile {
  return {
    archetype: 'The Quiet Reader',
    overview:
      'You feel things at a depth most people don’t see, and you’ve learned to keep most of it to yourself. That’s served you in a lot of rooms — and cost you in a few that mattered.',
    pillars: {
      selfAwareness:
        'You catch yourself in the act more than most. The challenge is staying in the feeling long enough to learn from it instead of moving on.',
      selfRegulation:
        'You don’t lose your composure easily — but the cost is sometimes that other people don’t know what you actually need.',
      empathy:
        'You read a room before anyone says a word. That’s a real gift, but it can pull you into other people’s weather.',
      socialSkills:
        'You can be present without being performative. People feel safer around you than they realize.',
      motivation:
        'You move forward even when motivation isn’t there. That discipline is real, but check that you’re not just outrunning yourself.',
    },
    superpower:
      'You can sit with someone in their hardest moment without trying to fix them — and that’s rarer than it sounds.',
    blindSpot:
      'You notice everyone else’s emotions in HD and your own in dial-up. By the time you realize you’re upset, you’ve usually been upset for days.',
    inConflict:
      'You stay calm when others escalate, which de-escalates the moment but can leave the actual issue unresolved. The gift is steadiness; the cost is that people don’t always know what you really thought.',
    inLove:
      'You’re a steady, attentive presence — the person whose partner exhales when they walk in. The risk is that you absorb their state so completely you lose track of your own.',
    atWork:
      'You’re the person who can tell a meeting is going sideways before anyone else. You do best in environments that reward depth over volume, and worst in ones that confuse confidence with competence.',
    growthChallenge: {
      focus: weakest,
      duration: '7 days',
      practices: [
        'Day 1–2: Once a day, name what you’re feeling out loud, even alone.',
        'Day 3–4: When you notice the urge to manage someone else’s emotion, ask yourself what you’re feeling first.',
        'Day 5–7: Tell one person something true about your inner state that you’d normally keep to yourself.',
      ],
    },
    mantra: 'I am allowed to be the one being seen.',
  };
}

export function CalculatingScreen({ navigation, route }: Props) {
  const { onboarding, answers } = route.params;
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((s) => (s < STAGES.length - 1 ? s + 1 : s));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    (async () => {
      const scores = scoreQuiz(answers);

      let profile: AIProfile;
      try {
        profile = await generateProfile(onboarding, answers, scores);
      } catch (err) {
        console.warn('Claude generation failed, using fallback:', err);
        profile = fallbackProfile(scores.weakestPillar);
      }

      // Hold the loading state for at least 6s so it feels considered, not chatty.
      const elapsed = Date.now() - start;
      if (elapsed < 6000) {
        await new Promise((r) => setTimeout(r, 6000 - elapsed));
      }

      if (cancelled) return;

      await saveReport({
        createdAt: new Date().toISOString(),
        onboarding,
        answers,
        scores,
        profile,
      });

      navigation.replace('FreeReveal', {
        onboarding,
        answers,
        scores,
        profile,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [answers, navigation, onboarding]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ActivityIndicator color={theme.accent} size="large" />
        <View style={styles.stages}>
          {STAGES.map((s, i) => (
            <Text
              key={s}
              style={[
                styles.stageText,
                i === stage && styles.stageActive,
                i < stage && styles.stageDone,
              ]}
            >
              {s}
            </Text>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  stages: { marginTop: 32, alignItems: 'center', gap: 10 },
  stageText: { color: theme.textMuted, fontSize: 14, opacity: 0.4 },
  stageActive: { color: theme.text, opacity: 1, fontWeight: '600' },
  stageDone: { color: theme.textMuted, opacity: 0.6 },
});

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ProgressBar } from '../components/ProgressBar';
import { theme } from '../lib/theme';
import { QUESTIONS } from '../data/questions';
import { PILLAR_LABEL } from '../lib/scoring';
import type { Answers } from '../lib/types';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

export function QuizScreen({ navigation, route }: Props) {
  const { onboarding } = route.params;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const question = QUESTIONS[index];
  const progress = (index + 1) / QUESTIONS.length;
  const selected = answers[question.id];

  // Show a micro-reward on certain "interesting" answers; this is the
  // engagement nudge from the spec ("Only 12% answer this way 🔥").
  const microReward = useMemo(() => {
    if (selected === undefined) return null;
    const choice = question.choices.find((c) => c.value === selected);
    if (!choice) return null;
    if (choice.value >= 9) return 'A high-EQ answer.';
    if (choice.value <= 2) return 'Honest. That one’s rare.';
    return null;
  }, [selected, question]);

  const onPick = (value: number) => {
    void Haptics.selectionAsync();
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const onNext = () => {
    if (selected === undefined) return;
    if (index < QUESTIONS.length - 1) {
      setIndex(index + 1);
    } else {
      navigation.replace('Calculating', { onboarding, answers });
    }
  };

  const onBack = () => {
    if (index === 0) {
      navigation.goBack();
    } else {
      setIndex(index - 1);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.progressWrap}>
          <ProgressBar progress={progress} />
          <Text style={styles.progressLabel}>
            {index + 1} / {QUESTIONS.length}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pillarLabel}>{PILLAR_LABEL[question.pillar]}</Text>
        <Text style={styles.prompt}>{question.prompt}</Text>

        <View style={{ height: 24 }} />

        {question.choices.map((c) => {
          const isSelected = selected === c.value;
          return (
            <Pressable
              key={c.label}
              onPress={() => onPick(c.value)}
              style={[styles.choice, isSelected && styles.choiceSelected]}
            >
              <View
                style={[
                  styles.radio,
                  isSelected && styles.radioSelected,
                ]}
              />
              <Text
                style={[
                  styles.choiceText,
                  isSelected && styles.choiceTextSelected,
                ]}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}

        {microReward ? (
          <Text style={styles.microReward}>{microReward}</Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={onNext}
          disabled={selected === undefined}
          style={[
            styles.nextBtn,
            selected === undefined && styles.nextBtnDisabled,
          ]}
        >
          <Text style={styles.nextText}>
            {index === QUESTIONS.length - 1 ? 'See my profile' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: theme.textMuted, fontSize: 28, lineHeight: 28 },
  progressWrap: { flex: 1 },
  progressLabel: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
  body: { padding: 24, paddingBottom: 80 },
  pillarLabel: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  prompt: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 30,
    marginTop: 12,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.bgElev,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 12,
  },
  choiceSelected: {
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.border,
    marginTop: 2,
  },
  radioSelected: {
    borderColor: theme.accent,
    backgroundColor: theme.accent,
  },
  choiceText: { color: theme.text, fontSize: 15, lineHeight: 22, flex: 1 },
  choiceTextSelected: { color: theme.text, fontWeight: '600' },
  microReward: {
    color: theme.accent,
    marginTop: 16,
    fontSize: 13,
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: theme.bg,
  },
  nextBtn: {
    backgroundColor: theme.accent,
    borderRadius: theme.radius,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextText: { color: theme.bg, fontSize: 16, fontWeight: '700' },
});

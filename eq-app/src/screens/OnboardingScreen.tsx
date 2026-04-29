import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { theme } from '../lib/theme';
import type { RootStackParamList } from '../navigation/types';
import type { Gender, MotivationReason } from '../lib/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'nonbinary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const MOTIVATIONS: { value: MotivationReason; label: string }[] = [
  { value: 'self_growth', label: 'I want to grow as a person' },
  { value: 'relationships', label: 'I’m working on my relationships' },
  { value: 'career', label: 'It matters for my career' },
  { value: 'curiosity', label: 'Just curious about myself' },
];

export function OnboardingScreen({ navigation }: Props) {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [motivation, setMotivation] = useState<MotivationReason | null>(null);

  const ageNum = parseInt(age, 10);
  const ageValid = !isNaN(ageNum) && ageNum >= 13 && ageNum <= 100;
  const canContinue = ageValid && gender && motivation;

  const onContinue = () => {
    if (!canContinue || !gender || !motivation) return;
    navigation.navigate('Quiz', {
      onboarding: { age: ageNum, gender, motivation },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Before we begin</Text>
        <Text style={styles.subtitle}>
          Three quick questions to personalize your results.
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>How old are you?</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            placeholder="—"
            placeholderTextColor={theme.textMuted}
            style={styles.input}
            maxLength={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.choices}>
            {GENDERS.map((g) => (
              <ChoicePill
                key={g.value}
                label={g.label}
                selected={gender === g.value}
                onPress={() => setGender(g.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>What brought you here?</Text>
          <View style={styles.choices}>
            {MOTIVATIONS.map((m) => (
              <ChoicePill
                key={m.value}
                label={m.label}
                wide
                selected={motivation === m.value}
                onPress={() => setMotivation(m.value)}
              />
            ))}
          </View>
        </View>

        <Button
          title="Continue"
          onPress={onContinue}
          disabled={!canContinue}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

interface PillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  wide?: boolean;
}

function ChoicePill({ label, selected, onPress, wide }: PillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        wide && styles.pillWide,
        selected && styles.pillSelected,
      ]}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  scroll: { flex: 1 },
  container: { padding: 24, paddingBottom: 48 },
  title: { color: theme.text, fontSize: 28, fontWeight: '700' },
  subtitle: { color: theme.textMuted, marginTop: 8, fontSize: 15 },
  section: { marginTop: 28 },
  label: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    color: theme.text,
    backgroundColor: theme.bgElev,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    borderWidth: 1,
    borderColor: theme.border,
  },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: theme.bgElev,
    borderWidth: 1,
    borderColor: theme.border,
  },
  pillWide: { width: '100%' },
  pillSelected: {
    backgroundColor: theme.accentSoft,
    borderColor: theme.accent,
  },
  pillText: { color: theme.textMuted, fontSize: 14, fontWeight: '500' },
  pillTextSelected: { color: theme.accent },
});

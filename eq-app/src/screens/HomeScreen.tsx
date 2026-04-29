import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { theme } from '../lib/theme';
import { loadReport, clearAll } from '../lib/storage';
import type { RootStackParamList } from '../navigation/types';
import type { SavedReport } from '../lib/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const RETAKE_DAYS = 30;

export function HomeScreen({ navigation }: Props) {
  const [report, setReport] = useState<SavedReport | null>(null);

  useEffect(() => {
    void loadReport().then(setReport);
  }, []);

  if (!report) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No profile yet.</Text>
          <Button
            title="Take the test"
            onPress={() => navigation.replace('Hook')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const taken = new Date(report.createdAt);
  const daysSince = Math.floor(
    (Date.now() - taken.getTime()) / (1000 * 60 * 60 * 24),
  );
  const daysUntilRetake = Math.max(0, RETAKE_DAYS - daysSince);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.kicker}>WELCOME BACK</Text>
        <Text style={styles.archetype}>{report.profile?.archetype}</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Today’s insight</Text>
          <Text style={styles.cardBody}>
            {report.profile?.mantra ?? '—'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Your growth challenge</Text>
          <Text style={styles.cardBody}>
            Focus: {report.profile?.growthChallenge.focus}
          </Text>
          {report.profile?.growthChallenge.practices.map((p, i) => (
            <Text key={i} style={styles.practice}>• {p}</Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Next retake</Text>
          <Text style={styles.cardBody}>
            {daysUntilRetake === 0
              ? 'You can retake the test now.'
              : `${daysUntilRetake} day${daysUntilRetake === 1 ? '' : 's'} until you can retake`}
          </Text>
        </View>

        <Button
          title="View full profile"
          onPress={() =>
            navigation.navigate('FullReveal', {
              onboarding: report.onboarding,
              answers: report.answers,
              scores: report.scores,
              profile: report.profile!,
            })
          }
          variant="secondary"
        />

        {daysUntilRetake === 0 ? (
          <Button
            title="Retake the test"
            onPress={async () => {
              await clearAll();
              navigation.replace('Hook');
            }}
            style={{ marginTop: 12 }}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  container: { padding: 24 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  emptyText: { color: theme.textMuted, fontSize: 16 },
  kicker: {
    color: theme.accent,
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '700',
  },
  archetype: {
    color: theme.text,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: theme.bgElev,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
    marginBottom: 12,
  },
  cardLabel: {
    color: theme.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  cardBody: { color: theme.text, fontSize: 15, lineHeight: 22 },
  practice: {
    color: theme.text,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
});

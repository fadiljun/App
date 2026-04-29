import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Share,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { PillarCard } from '../components/PillarCard';
import { RadarChart } from '../components/RadarChart';
import { theme } from '../lib/theme';
import { PILLAR_LABEL } from '../lib/scoring';
import type { RootStackParamList } from '../navigation/types';
import type { Pillar } from '../lib/types';

type Props = NativeStackScreenProps<RootStackParamList, 'FullReveal'>;

const PILLARS: Pillar[] = [
  'selfAwareness',
  'selfRegulation',
  'empathy',
  'socialSkills',
  'motivation',
];

export function FullRevealScreen({ navigation, route }: Props) {
  const { scores, profile } = route.params;
  const [displayScore, setDisplayScore] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animated countup on the headline EQ number — the "reveal moment".
  useEffect(() => {
    const target = scores.eqScore;
    const start = Date.now();
    const duration = 1600;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      // Ease-out cubic — fast start, gentle landing.
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * target));
      if (t >= 1 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 30);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [scores.eqScore]);

  const onShare = async () => {
    try {
      await Share.share({
        message: `My EQ archetype: ${profile.archetype}. EQ ${scores.eqScore}, top ${100 - scores.percentile}%. Find your number → eqapp.example`,
      });
    } catch {
      // User cancelled — no-op.
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.kicker}>YOUR EQ PROFILE</Text>
        <Text style={styles.archetype}>{profile.archetype}</Text>
        <Text style={styles.overview}>{profile.overview}</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Composite EQ</Text>
          <Text style={styles.scoreValue}>{displayScore}</Text>
          <Text style={styles.scoreHint}>
            Top {100 - scores.percentile}% · {bandLabel(scores.band)}
          </Text>
        </View>

        <View style={styles.radarWrap}>
          <RadarChart scores={scores.pillarScores} />
        </View>

        <Section label="The 5 pillars">
          {PILLARS.map((p) => (
            <PillarCard
              key={p}
              pillar={p}
              score={scores.pillarScores[p]}
              body={profile.pillars[p]}
            />
          ))}
        </Section>

        <Section label="Your superpower">
          <Text style={styles.body}>{profile.superpower}</Text>
        </Section>

        <Section label="Your blind spot">
          <Text style={styles.body}>{profile.blindSpot}</Text>
        </Section>

        <Section label="In conflict">
          <Text style={styles.body}>{profile.inConflict}</Text>
        </Section>

        <Section label="In love">
          <Text style={styles.body}>{profile.inLove}</Text>
        </Section>

        <Section label="At work">
          <Text style={styles.body}>{profile.atWork}</Text>
        </Section>

        <Section label="Your 7-day growth challenge">
          <Text style={styles.body}>
            Focus area:{' '}
            <Text style={styles.accent}>{profile.growthChallenge.focus}</Text>
          </Text>
          <View style={{ height: 8 }} />
          {profile.growthChallenge.practices.map((p, i) => (
            <Text key={i} style={styles.practice}>
              • {p}
            </Text>
          ))}
        </Section>

        <View style={styles.mantraCard}>
          <Text style={styles.mantraLabel}>YOUR MANTRA</Text>
          <Text style={styles.mantraText}>“{profile.mantra}”</Text>
        </View>

        <Button title="Share my profile" onPress={onShare} />
        <Button
          title="Done"
          onPress={() => navigation.replace('Home')}
          variant="secondary"
          style={{ marginTop: 12 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function bandLabel(band: string): string {
  switch (band) {
    case 'exceptional': return 'Exceptional';
    case 'high': return 'High';
    case 'average': return 'Average';
    default: return 'Developing';
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  container: { padding: 24, paddingBottom: 48 },
  kicker: {
    color: theme.accent,
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 8,
  },
  archetype: {
    color: theme.text,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  overview: {
    color: theme.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  scoreCard: {
    backgroundColor: theme.bgElev,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 24,
    marginTop: 24,
    alignItems: 'center',
  },
  scoreLabel: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  scoreValue: {
    color: theme.accent,
    fontSize: 64,
    fontWeight: '800',
    marginTop: 8,
  },
  scoreHint: { color: theme.text, fontSize: 14, marginTop: 4 },
  radarWrap: {
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: theme.bgElev,
    borderRadius: theme.radius,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  section: { marginTop: 32 },
  sectionLabel: {
    color: theme.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  body: { color: theme.text, fontSize: 15, lineHeight: 24 },
  accent: { color: theme.accent, fontWeight: '700' },
  practice: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
  mantraCard: {
    backgroundColor: theme.accentSoft,
    borderRadius: theme.radius,
    padding: 24,
    marginTop: 32,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.accent,
  },
  mantraLabel: {
    color: theme.accent,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
  mantraText: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 26,
  },
});

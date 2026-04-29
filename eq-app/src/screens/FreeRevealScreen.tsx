import React from 'react';
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
import { PILLAR_LABEL } from '../lib/scoring';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'FreeReveal'>;

const BAND_COPY: Record<string, string> = {
  developing: 'Developing — there’s real room to grow here',
  average: 'Solid average — most of the population sits here',
  high: 'High — you’re in the top quarter',
  exceptional: 'Exceptional — top few percent',
};

export function FreeRevealScreen({ navigation, route }: Props) {
  const { scores, profile } = route.params;
  const dominantLabel = PILLAR_LABEL[scores.dominantPillar];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.kicker}>YOUR EQ PROFILE</Text>
        <Text style={styles.archetype}>{profile.archetype}</Text>

        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Composite EQ</Text>
            <Text style={[styles.scoreValue, styles.blurred]}>
              ●●●
            </Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Percentile</Text>
            <Text style={[styles.scoreValue, styles.blurred]}>●●●</Text>
          </View>
        </View>

        <Text style={styles.bandHint}>
          {BAND_COPY[scores.band] ?? ''}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Your dominant strength</Text>
        <Text style={styles.dominant}>{dominantLabel}</Text>
        <Text style={styles.dominantBody}>
          {profile.pillars[scores.dominantPillar]}
        </Text>

        <View style={styles.divider} />

        <View style={styles.lockedSection}>
          <Text style={styles.lockBadge}>🔒 LOCKED</Text>
          <Text style={styles.lockTitle}>The full read on you</Text>
          <Text style={styles.lockBody}>
            Your blind spot · superpower · how you show up in conflict, in love,
            at work · your 7-day growth challenge · your archetype mantra · the
            full radar across all 5 pillars.
          </Text>
        </View>

        <Button
          title="Unlock my full profile"
          onPress={() => navigation.navigate('Paywall', route.params)}
          style={{ marginTop: 24 }}
        />
        <Text style={styles.smallPrint}>
          For self-reflection — not a clinical assessment.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
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
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: theme.bgElev,
    padding: 16,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.border,
  },
  scoreLabel: { color: theme.textMuted, fontSize: 12 },
  scoreValue: {
    color: theme.text,
    fontSize: 32,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 6,
  },
  blurred: {
    // Plain RN can't natively blur, so fake it: muted color, big spacing.
    color: theme.textMuted,
    opacity: 0.6,
  },
  bandHint: {
    color: theme.textMuted,
    fontSize: 13,
    marginTop: 12,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 28,
  },
  sectionLabel: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  dominant: { color: theme.accent, fontSize: 22, fontWeight: '700' },
  dominantBody: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  lockedSection: {
    backgroundColor: theme.bgElev,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
  },
  lockBadge: {
    color: theme.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  lockTitle: { color: theme.text, fontSize: 18, fontWeight: '700' },
  lockBody: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  smallPrint: {
    color: theme.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
  },
});

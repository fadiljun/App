import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../lib/theme';
import { PILLAR_LABEL } from '../lib/scoring';
import type { Pillar } from '../lib/types';

interface Props {
  pillar: Pillar;
  score: number;
  body?: string;
}

export function PillarCard({ pillar, score, body }: Props) {
  const color = theme.pillar[pillar] ?? theme.accent;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.label}>{PILLAR_LABEL[pillar]}</Text>
        <Text style={[styles.score, { color }]}>{score}</Text>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.min(100, Math.max(0, score))}%`, backgroundColor: color },
          ]}
        />
      </View>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.bgElev,
    borderRadius: theme.radius,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  label: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
  },
  barTrack: {
    height: 6,
    backgroundColor: theme.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 12,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  body: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
});

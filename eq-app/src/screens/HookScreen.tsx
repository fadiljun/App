import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { theme } from '../lib/theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Hook'>;

export function HookScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.kicker}>EQ</Text>
        </View>

        <View style={styles.middle}>
          <Text style={styles.headline}>
            IQ gets you hired.{'\n'}
            <Text style={styles.headlineAccent}>EQ gets you everything else.</Text>
          </Text>
          <Text style={styles.sub}>
            94% of top performers have high emotional intelligence. Most
            overestimate theirs. Where do you really stand?
          </Text>
        </View>

        <View style={styles.bottom}>
          <Button
            title="Start the test"
            onPress={() => navigation.navigate('Onboarding')}
          />
          <Text style={styles.disclaimer}>
            30 questions · ~5 minutes · for self-reflection
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 32,
  },
  top: {},
  kicker: {
    color: theme.accent,
    fontSize: 14,
    letterSpacing: 6,
    fontWeight: '700',
  },
  middle: { flex: 1, justifyContent: 'center' },
  headline: {
    color: theme.text,
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 44,
    marginBottom: 24,
  },
  headlineAccent: { color: theme.accent },
  sub: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  bottom: { gap: 12 },
  disclaimer: {
    color: theme.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});

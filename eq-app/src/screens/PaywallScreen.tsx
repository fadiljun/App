import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { theme } from '../lib/theme';
import { setPaid } from '../lib/storage';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

type Plan = 'weekly' | 'yearly' | 'lifetime';

interface PlanOption {
  id: Plan;
  title: string;
  price: string;
  cadence: string;
  badge?: string;
  trial?: string;
}

const PLANS: PlanOption[] = [
  {
    id: 'yearly',
    title: 'Yearly',
    price: '$39.99',
    cadence: 'per year (~$3.33/mo)',
    badge: 'BEST VALUE · SAVE 75%',
    trial: '3-day free trial, then $39.99/yr',
  },
  {
    id: 'lifetime',
    title: 'Lifetime',
    price: '$14.99',
    cadence: 'one-time',
    trial: 'Pay once, keep forever',
  },
  {
    id: 'weekly',
    title: 'Weekly',
    price: '$6.99',
    cadence: 'per week',
    trial: '3-day free trial, then $6.99/wk',
  },
];

export function PaywallScreen({ navigation, route }: Props) {
  const [selected, setSelected] = useState<Plan>('yearly');
  const [purchasing, setPurchasing] = useState(false);

  const onSubscribe = async () => {
    // RevenueCat goes here. For now we simulate the unlock so the flow is
    // testable end-to-end on TestFlight without billing wired up.
    setPurchasing(true);
    await new Promise((r) => setTimeout(r, 800));
    await setPaid(true);
    setPurchasing(false);
    navigation.replace('FullReveal', route.params);
  };

  const onRestore = async () => {
    // RevenueCat: client.restorePurchases() goes here.
    await setPaid(true);
    navigation.replace('FullReveal', route.params);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
          hitSlop={12}
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <Text style={styles.title}>Unlock your full profile</Text>
        <Text style={styles.subtitle}>
          The blurred score, your blind spot, the full radar, your 7-day growth
          plan, and your shareable certificate.
        </Text>

        <View style={styles.bullets}>
          <Bullet text="Your full composite EQ + percentile" />
          <Bullet text="Blind spot you didn’t know to look for" />
          <Bullet text="Pattern reads on conflict, love, work" />
          <Bullet text="Personalized 7-day growth practice" />
          <Bullet text="Retake every 30 days to track growth" />
        </View>

        <View style={styles.plans}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selected === plan.id}
              onPress={() => setSelected(plan.id)}
            />
          ))}
        </View>

        <Button
          title={
            selected === 'lifetime'
              ? 'Get lifetime access'
              : 'Start free trial'
          }
          onPress={onSubscribe}
          loading={purchasing}
          style={{ marginTop: 16 }}
        />

        <Pressable onPress={onRestore} style={styles.restore}>
          <Text style={styles.restoreText}>Restore purchase</Text>
        </Pressable>

        <Text style={styles.legal}>
          Subscriptions auto-renew until canceled in App Store settings. Cancel
          any time during the trial. Terms · Privacy
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>✓</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

interface PlanProps {
  plan: PlanOption;
  selected: boolean;
  onPress: () => void;
}

function PlanCard({ plan, selected, onPress }: PlanProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.planCard, selected && styles.planCardSelected]}
    >
      {plan.badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{plan.badge}</Text>
        </View>
      ) : null}
      <View style={styles.planRow}>
        <View style={[styles.radio, selected && styles.radioSelected]} />
        <View style={styles.planContent}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          {plan.trial ? (
            <Text style={styles.planTrial}>{plan.trial}</Text>
          ) : null}
        </View>
        <View style={styles.priceCol}>
          <Text style={styles.planPrice}>{plan.price}</Text>
          <Text style={styles.planCadence}>{plan.cadence}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  container: { padding: 24, paddingTop: 12, paddingBottom: 48 },
  closeBtn: { alignSelf: 'flex-end', padding: 4, marginBottom: 4 },
  closeText: { color: theme.textMuted, fontSize: 22 },
  title: { color: theme.text, fontSize: 28, fontWeight: '700' },
  subtitle: {
    color: theme.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  bullets: { marginTop: 20, gap: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletDot: { color: theme.accent, fontSize: 16, fontWeight: '700' },
  bulletText: { color: theme.text, fontSize: 14, flex: 1, lineHeight: 22 },
  plans: { marginTop: 24, gap: 10 },
  planCard: {
    backgroundColor: theme.bgElev,
    borderRadius: theme.radius,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  planCardSelected: {
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
  },
  badge: {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: theme.accent,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: theme.bg,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.border,
  },
  radioSelected: {
    borderColor: theme.accent,
    backgroundColor: theme.accent,
  },
  planContent: { flex: 1 },
  planTitle: { color: theme.text, fontSize: 16, fontWeight: '700' },
  planTrial: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
  priceCol: { alignItems: 'flex-end' },
  planPrice: { color: theme.text, fontSize: 18, fontWeight: '700' },
  planCadence: { color: theme.textMuted, fontSize: 11, marginTop: 2 },
  restore: { alignItems: 'center', marginTop: 16, padding: 8 },
  restoreText: { color: theme.textMuted, fontSize: 13 },
  legal: {
    color: theme.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
});

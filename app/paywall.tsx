import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Entrance } from '../components/entrance';
import { PlanCard } from '../components/plan-card';
import { PremiumButton } from '../components/premium-button';
import { colors, layout, radii, shadows, spacing, typography } from '../lib/theme';
import { SubscriptionPlan } from '../lib/types';
import { useZenPulse } from '../providers/zen-pulse-provider';

const benefits = [
  'Premium soundscapes and longer guided sessions',
  'Longer sleep, focus, and evening rituals with richer pacing',
  'A curated sleep-and-focus library with locked masterclasses',
];

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ source?: string }>();
  const { activatePremium, isSubscribed, selectedPlan, setSelectedPlan, storageError } = useZenPulse();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  const contextualCopy = useMemo(() => {
    if (params.source === 'locked') {
      return 'That ritual is part of ZenPulse Premium. Unlock the full calm library or continue with the lighter free path.';
    }

    return 'A premium reset ritual for people who want meditation to feel intentional, beautiful, and easy to return to every day.';
  }, [params.source]);

  const handlePlanPress = async (plan: SubscriptionPlan) => {
    setError(null);
    await setSelectedPlan(plan);

    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  };

  const handleSubscribe = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      await activatePremium(selectedPlan);

      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.replace('/meditations');
    } catch (subscriptionError) {
      setError(subscriptionError instanceof Error ? subscriptionError.message : 'We could not activate premium on this device.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    router.replace('/meditations');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, isCompact ? styles.contentCompact : null]} showsVerticalScrollIndicator={false}>
        <View style={[styles.bloom, styles.bloomLeft]} />
        <View style={[styles.bloom, styles.bloomRight]} />

        <Entrance delay={40}>
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons color={colors.goldDeep} name="crown-outline" size={16} />
              <Text style={styles.heroBadgeText}>ZenPulse Premium</Text>
            </View>
            <Text style={styles.overline}>A softer nervous system, designed beautifully.</Text>
            <Text style={[styles.heroTitle, isCompact ? styles.heroTitleCompact : null]}>Meditation that feels luxurious, not generic.</Text>
            <Text style={[styles.heroBody, isCompact ? styles.heroBodyCompact : null]}>{contextualCopy}</Text>
          </View>
        </Entrance>

        <Entrance delay={100}>
          <View accessibilityLabel="Subscription plans" accessibilityRole="radiogroup" style={styles.plansWrap}>
            <PlanCard
              cadence="Pay month to month"
              footnote="Ideal if you want a gentle trial without a long commitment."
              onPress={() => handlePlanPress('monthly')}
              price="$11.99"
              selected={selectedPlan === 'monthly'}
              title="Monthly"
            />
            <PlanCard
              badge="Best value"
              cadence="One payment, full year"
              footnote="Save 38% and keep every premium ritual unlocked all year."
              onPress={() => handlePlanPress('yearly')}
              price="$74.99"
              selected={selectedPlan === 'yearly'}
              title="Yearly"
            />
          </View>
        </Entrance>

        <Entrance delay={160} style={styles.benefitsCard}>
          <Text style={styles.sectionTitle}>What unlocks with Premium</Text>
          <View style={styles.benefitsList}>
            {benefits.map((benefit) => (
              <View key={benefit} style={styles.benefitRow}>
                <View style={styles.benefitIconWrap}>
                  <MaterialCommunityIcons color={colors.plumDeep} name="check-decagram" size={18} />
                </View>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </Entrance>

        {storageError || error ? (
          <View style={styles.errorCard}>
            <MaterialCommunityIcons color={colors.rose} name="alert-circle-outline" size={18} />
            <Text style={styles.errorText}>{error ?? storageError}</Text>
          </View>
        ) : null}

        <Entrance delay={220}>
          <PremiumButton
            accessibilityHint={selectedPlan === 'yearly' ? 'Simulates a seven-day free trial and unlocks all premium sessions.' : 'Simulates a monthly free trial and unlocks premium sessions.'}
            accessibilityLabel={selectedPlan === 'yearly' ? 'Try yearly premium free for seven days' : 'Start a monthly free trial'}
            loading={submitting}
            onPress={handleSubscribe}
            subtitle={selectedPlan === 'yearly' ? 'Simulated purchase, instant premium access' : 'Monthly trial feel, immediate unlock'}
            title={selectedPlan === 'yearly' ? 'Try premium free for 7 days' : 'Start a monthly free trial'}
          />
        </Entrance>

        <Pressable
          accessibilityHint={isSubscribed ? 'Returns to the unlocked meditation library.' : 'Skips premium and continues with only the free meditation sessions.'}
          accessibilityLabel={isSubscribed ? 'Back to your library' : 'Continue with limited access'}
          accessibilityRole="button"
          onPress={handleContinue}
          style={({ pressed }) => [styles.secondaryAction, pressed ? styles.secondaryPressed : null]}
        >
          <Text style={styles.secondaryActionText}>{isSubscribed ? 'Back to your library' : 'Continue with limited access'}</Text>
        </Pressable>

        <Text style={styles.footnote}>
          Premium activation is simulated for this prototype, then stored locally so the full library unlocks instantly on the device.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  contentCompact: {
    paddingHorizontal: spacing.md,
  },
  bloom: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: radii.pill,
    opacity: 0.22,
    pointerEvents: 'none',
  },
  bloomLeft: {
    top: 24,
    left: -68,
    backgroundColor: colors.rose,
  },
  bloomRight: {
    top: 170,
    right: -72,
    backgroundColor: colors.plum,
  },
  heroCard: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: colors.cardStroke,
    gap: spacing.md,
    ...shadows.card,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: '#FFF2CE',
  },
  heroBadgeText: {
    color: colors.goldDeep,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  overline: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    ...typography.hero,
    color: colors.text,
  },
  heroTitleCompact: {
    fontSize: 32,
    lineHeight: 38,
  },
  heroBody: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '500',
  },
  heroBodyCompact: {
    fontSize: 15,
    lineHeight: 23,
  },
  plansWrap: {
    gap: spacing.md,
  },
  benefitsCard: {
    borderRadius: radii.lg,
    padding: spacing.xl,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.cardStroke,
    gap: spacing.lg,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  benefitsList: {
    gap: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  benefitIconWrap: {
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    backgroundColor: '#F2EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: '#FFF2F7',
    borderWidth: 1,
    borderColor: '#F7D3E3',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  errorText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  secondaryAction: {
    minHeight: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.cardStroke,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  secondaryPressed: {
    transform: [{ scale: 0.99 }],
  },
  secondaryActionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  footnote: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});

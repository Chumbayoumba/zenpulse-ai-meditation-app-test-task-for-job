import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Entrance } from '../components/entrance';
import { MeditationCard } from '../components/meditation-card';
import { PremiumButton } from '../components/premium-button';
import { meditationSessions } from '../data/meditations';
import { colors, layout, radii, shadows, spacing, typography } from '../lib/theme';
import { useZenPulse } from '../providers/zen-pulse-provider';

export default function MeditationsScreen() {
  const router = useRouter();
  const { isSubscribed, lastAffirmation, selectedPlan } = useZenPulse();
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  const handleSessionPress = (sessionId: string, locked: boolean) => {
    if (locked) {
      router.push({ pathname: '/paywall', params: { source: 'locked' } });
      return;
    }

    router.push('/affirmation');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, isCompact ? styles.contentCompact : null]} showsVerticalScrollIndicator={false}>
        <View style={[styles.bloom, styles.bloomTop]} />
        <Entrance delay={40}>
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.eyebrow}>Today’s library</Text>
                <Text style={styles.heroTitle}>Choose a ritual that matches your pace.</Text>
              </View>
              <View style={[styles.statusPill, isSubscribed ? styles.statusSubscribed : styles.statusFree]}>
                <MaterialCommunityIcons color={isSubscribed ? colors.success : colors.plumDeep} name={isSubscribed ? 'check-circle-outline' : 'lock-outline'} size={16} />
                <Text style={[styles.statusText, isSubscribed ? styles.statusTextSubscribed : null]}>
                  {isSubscribed ? `${selectedPlan} active` : 'Free path'}
                </Text>
              </View>
            </View>
            <Text style={styles.heroBody}>
              {isSubscribed
                ? 'Everything is unlocked. Move between quick resets, focus rituals, and slow evenings.'
                : 'You can browse the library now. Premium sessions stay visibly locked and route back to the paywall.'}
            </Text>
          </View>
        </Entrance>

        {!isSubscribed ? (
          <Entrance delay={110}>
            <View style={styles.bannerCard}>
              <View style={styles.bannerCopy}>
                <Text style={styles.bannerTitle}>Unlock the full calm collection</Text>
                <Text style={styles.bannerBody}>
                  Premium adds longer rituals, richer soundscapes, and the full sleep library.
                </Text>
              </View>
              <Pressable
                accessibilityHint="Opens the premium subscription screen."
                accessibilityLabel="Open premium paywall"
                accessibilityRole="button"
                onPress={() => router.push('/paywall')}
                style={({ pressed }) => [styles.bannerAction, pressed ? styles.bannerActionPressed : null]}
              >
                <Text style={styles.bannerActionText}>Open paywall</Text>
              </Pressable>
            </View>
          </Entrance>
        ) : null}

        <Entrance delay={160}>
          <View style={styles.aiCard}>
            <View style={[styles.aiHeader, isCompact ? styles.aiHeaderCompact : null]}>
              <View>
                <Text style={styles.eyebrow}>AI Mood of the day</Text>
                <Text style={[styles.aiTitle, isCompact ? styles.aiTitleCompact : null]}>Generate a short affirmation from your current vibe.</Text>
              </View>
              <View style={[styles.aiIcon, isCompact ? styles.aiIconCompact : null]}>
                <MaterialCommunityIcons color={colors.plumDeep} name="creation-outline" size={24} />
              </View>
            </View>
            <Text numberOfLines={3} style={styles.aiSnippet}>
              {lastAffirmation?.text ?? 'Choose how you feel, then let ZenPulse write a fresh line to steady the rest of the day.'}
            </Text>
            <PremiumButton
              accessibilityHint="Opens the AI mood screen to generate a new affirmation."
              onPress={() => router.push('/affirmation')}
              subtitle="Three moods. One fresh line, generated live."
              title="Open AI ritual"
            />
          </View>
        </Entrance>

        <View style={[styles.sectionHeader, isCompact ? styles.sectionHeaderCompact : null]}>
          <Text style={styles.sectionTitle}>Meditation sessions</Text>
          <Text style={styles.sectionMeta}>{isSubscribed ? '6 available' : '2 free · 4 locked'}</Text>
        </View>

        <View style={styles.grid}>
          {meditationSessions.map((session, index) => {
            const locked = !isSubscribed && session.premium;
            return (
              <Entrance delay={220 + index * 45} key={session.id}>
                <MeditationCard onPress={() => handleSessionPress(session.id, locked)} locked={locked} session={session} />
              </Entrance>
            );
          })}
        </View>
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
    width: 230,
    height: 230,
    borderRadius: radii.pill,
    opacity: 0.2,
    backgroundColor: colors.plum,
    pointerEvents: 'none',
  },
  bloomTop: {
    right: -88,
    top: 40,
  },
  heroCard: {
    borderRadius: radii.xl,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: colors.cardStroke,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.card,
  },
  heroTopRow: {
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    ...typography.sectionTitle,
    color: colors.text,
    marginTop: spacing.sm,
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  statusSubscribed: {
    backgroundColor: '#E7F7F1',
  },
  statusFree: {
    backgroundColor: '#F2EAFF',
  },
  statusText: {
    color: colors.plumDeep,
    fontSize: 12,
    fontWeight: '800',
  },
  statusTextSubscribed: {
    color: colors.success,
  },
  heroBody: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '600',
  },
  bannerCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    backgroundColor: '#FFF7FB',
    borderWidth: 1,
    borderColor: colors.cardStroke,
    gap: spacing.md,
  },
  bannerCopy: {
    gap: spacing.sm,
  },
  bannerTitle: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  bannerBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  bannerAction: {
    alignSelf: 'flex-start',
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerActionPressed: {
    transform: [{ scale: 0.985 }],
  },
  bannerActionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  aiCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.cardStroke,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.card,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  aiHeaderCompact: {
    flexDirection: 'column',
  },
  aiTitle: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  aiTitleCompact: {
    fontSize: 22,
    lineHeight: 28,
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: '#F3EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIconCompact: {
    alignSelf: 'flex-start',
  },
  aiSnippet: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  sectionHeaderCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  sectionMeta: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  grid: {
    gap: spacing.md,
  },
});

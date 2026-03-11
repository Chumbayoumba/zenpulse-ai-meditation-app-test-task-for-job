import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Entrance } from '../../components/entrance';
import { PremiumButton } from '../../components/premium-button';
import { meditationSessions } from '../../data/meditations';
import { colors, layout, radii, shadows, spacing, typography } from '../../lib/theme';
import { useZenPulse } from '../../providers/zen-pulse-provider';

export default function SessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { isSubscribed } = useZenPulse();
  const { width } = useWindowDimensions();
  const [cueIndex, setCueIndex] = useState(0);
  const isCompact = width < 360;

  const session = useMemo(
    () => meditationSessions.find((entry) => entry.id === params.id),
    [params.id],
  );

  if (!session) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.fallbackWrap}>
          <Text style={styles.fallbackTitle}>We could not find that ritual.</Text>
          <PremiumButton accessibilityHint="Returns to the meditation library." onPress={() => router.replace('/meditations')} title="Back to library" />
        </View>
      </SafeAreaView>
    );
  }

  if (session.premium && !isSubscribed) {
    return <Redirect href={{ pathname: '/paywall', params: { source: 'locked' } }} />;
  }

  const isLastCue = cueIndex === session.cues.length - 1;

  const handleAdvance = () => {
    setCueIndex((currentIndex) => (currentIndex === session.cues.length - 1 ? 0 : currentIndex + 1));

    if (Platform.OS !== 'web') {
      if (isLastCue) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        void Haptics.selectionAsync();
      }
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, isCompact ? styles.contentCompact : null]} showsVerticalScrollIndicator={false}>
        <Entrance delay={40}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityHint="Returns to the meditation library."
              accessibilityLabel="Go back to meditations"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed ? styles.backPressed : null]}
            >
              <MaterialCommunityIcons color={colors.text} name="arrow-left" size={20} />
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>Guided session</Text>
              <Text style={[styles.headerTitle, isCompact ? styles.headerTitleCompact : null]}>{session.title}</Text>
            </View>
          </View>
        </Entrance>

        <Entrance delay={110}>
          <LinearGradient colors={session.palette} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>{session.category}</Text>
              </View>
              <View style={styles.heroMetaChip}>
                <MaterialCommunityIcons color={colors.white} name="timer-sand" size={14} />
                <Text style={styles.heroMetaText}>{session.minutes} min</Text>
              </View>
            </View>
            <Text style={[styles.heroLine, isCompact ? styles.heroLineCompact : null]}>{session.themeLine}</Text>
            <Text style={styles.heroSubtitle}>{session.subtitle}</Text>
          </LinearGradient>
        </Entrance>

        <Entrance delay={180}>
          <View style={styles.playerCard}>
            <View style={styles.playerHeader}>
              <View>
                <Text style={styles.playerEyebrow}>Cue {cueIndex + 1} of {session.cues.length}</Text>
                <Text style={styles.playerTitle}>Move through the ritual at your own pace.</Text>
              </View>
              <View style={styles.playerIcon}>
                <MaterialCommunityIcons color={colors.plumDeep} name="meditation" size={22} />
              </View>
            </View>
            <Text style={[styles.playerCue, isCompact ? styles.playerCueCompact : null]}>{session.cues[cueIndex]}</Text>
            <PremiumButton
              accessibilityHint={isLastCue ? 'Restarts the cue flow from the beginning.' : 'Advances to the next guided cue.'}
              onPress={handleAdvance}
              subtitle="Prototype player: tactile cue progression instead of full audio playback."
              title={isLastCue ? 'Restart ritual flow' : 'Advance to next cue'}
            />
          </View>
        </Entrance>

        <Entrance delay={250}>
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Session flow</Text>
            <View style={styles.timelineList}>
              {session.cues.map((cue, index) => {
                const active = index === cueIndex;
                return (
                  <View key={cue} style={[styles.timelineItem, active ? styles.timelineItemActive : null]}>
                    <View style={[styles.timelineIndex, active ? styles.timelineIndexActive : null]}>
                      <Text style={[styles.timelineIndexText, active ? styles.timelineIndexTextActive : null]}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.timelineCopy, active ? styles.timelineCopyActive : null]}>{cue}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Entrance>
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
  fallbackWrap: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  fallbackTitle: {
    ...typography.sectionTitle,
    color: colors.text,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardStroke,
  },
  backPressed: {
    transform: [{ scale: 0.98 }],
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    ...typography.sectionTitle,
    color: colors.text,
    marginTop: spacing.sm,
  },
  headerTitleCompact: {
    fontSize: 24,
    lineHeight: 30,
  },
  heroCard: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    minHeight: 220,
    justifyContent: 'space-between',
    ...shadows.glow,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  heroTagText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(36, 18, 50, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroMetaText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  heroLine: {
    color: colors.white,
    fontFamily: typography.hero.fontFamily,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
  },
  heroLineCompact: {
    fontSize: 25,
    lineHeight: 31,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  playerCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.cardStroke,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.card,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  playerEyebrow: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  playerTitle: {
    color: colors.text,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  playerIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: '#F3EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerCue: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  },
  playerCueCompact: {
    fontSize: 24,
    lineHeight: 31,
  },
  timelineCard: {
    borderRadius: radii.xl,
    backgroundColor: 'rgba(255,255,255,0.74)',
    borderWidth: 1,
    borderColor: colors.cardStroke,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  timelineTitle: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
  },
  timelineList: {
    gap: spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.cardStroke,
  },
  timelineItemActive: {
    borderColor: colors.rose,
    backgroundColor: '#FFF4FA',
  },
  timelineIndex: {
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    backgroundColor: '#F1E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  timelineIndexActive: {
    backgroundColor: colors.rose,
  },
  timelineIndexText: {
    color: colors.plumDeep,
    fontSize: 13,
    fontWeight: '800',
  },
  timelineIndexTextActive: {
    color: colors.white,
  },
  timelineCopy: {
    flex: 1,
    minWidth: 0,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  timelineCopyActive: {
    color: colors.text,
  },
});

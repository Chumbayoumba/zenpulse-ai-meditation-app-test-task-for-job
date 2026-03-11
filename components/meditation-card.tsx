import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MeditationSession } from '../lib/types';
import { colors, radii, shadows, spacing, typography } from '../lib/theme';

interface MeditationCardProps {
  session: MeditationSession;
  locked: boolean;
  onPress: () => void;
}

export function MeditationCard({ session, locked, onPress }: MeditationCardProps) {
  return (
    <Pressable
      accessibilityHint={locked ? 'Opens the paywall to unlock this premium session.' : 'Opens the guided session screen.'}
      accessibilityLabel={`${session.title}, ${session.minutes} minute ${session.category} session. ${locked ? 'Premium locked.' : 'Available now.'}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <LinearGradient colors={session.palette} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cover}>
        <LinearGradient
          colors={[colors.mediaScrimTop, 'rgba(53, 32, 58, 0.05)', colors.mediaScrimBottom]}
          end={{ x: 1, y: 1 }}
          pointerEvents="none"
          start={{ x: 0, y: 0 }}
          style={styles.coverScrim}
        />
        <View style={styles.coverContent}>
          <View style={styles.coverTopRow}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{session.category}</Text>
            </View>
            <View style={styles.minutesTag}>
              <MaterialCommunityIcons color={colors.textOnTint} name="timer-sand" size={14} />
              <Text style={styles.minutesText}>{session.minutes} min</Text>
            </View>
          </View>
          <MaterialCommunityIcons color={colors.textOnTintMuted} name="waves" size={46} />
        </View>
      </LinearGradient>
      <View style={styles.copyArea}>
        <Text numberOfLines={2} style={styles.title}>
          {session.title}
        </Text>
        <Text numberOfLines={2} style={styles.subtitle}>
          {session.subtitle}
        </Text>
      </View>
      {locked ? (
        <View style={styles.lockedOverlay}>
          <View style={styles.lockedBadge}>
            <MaterialCommunityIcons color={colors.white} name="lock-outline" size={16} />
            <Text style={styles.lockedText}>Premium</Text>
          </View>
          <Text style={styles.lockedCaption}>Unlock this ritual on the paywall</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.cardStroke,
    ...shadows.card,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  cover: {
    padding: spacing.lg,
    minHeight: 168,
    position: 'relative',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  coverScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  coverContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  coverTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  categoryTag: {
    backgroundColor: colors.mediaChip,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.mediaStroke,
  },
  categoryText: {
    color: colors.textOnTint,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  minutesTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.mediaChipStrong,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.mediaStroke,
  },
  minutesText: {
    color: colors.textOnTint,
    fontSize: 12,
    fontWeight: '800',
  },
  copyArea: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.cardTitle,
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  lockedBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.mediaChipStrong,
    borderWidth: 1,
    borderColor: colors.mediaStroke,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  lockedText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  lockedCaption: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
});

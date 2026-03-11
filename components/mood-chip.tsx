import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../lib/theme';

interface MoodChipProps {
  emoji: string;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}

export function MoodChip({ emoji, title, subtitle, selected, onPress }: MoodChipProps) {
  return (
    <Pressable
      accessibilityHint={subtitle}
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.base, selected ? styles.selected : styles.idle, pressed ? styles.pressed : null]}
    >
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text numberOfLines={2} style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    minWidth: 0,
  },
  idle: {
    borderColor: colors.cardStroke,
    backgroundColor: colors.surfaceStrong,
  },
  selected: {
    borderColor: colors.rose,
    backgroundColor: '#FFF3FA',
  },
  pressed: {
    transform: [{ scale: 0.988 }],
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});

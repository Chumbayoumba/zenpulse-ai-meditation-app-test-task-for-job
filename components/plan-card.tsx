import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, radii, shadows, spacing } from '../lib/theme';

interface PlanCardProps {
  title: string;
  price: string;
  cadence: string;
  footnote: string;
  selected: boolean;
  badge?: string;
  onPress: () => void;
}

export function PlanCard({ title, price, cadence, footnote, selected, badge, onPress }: PlanCardProps) {
  return (
    <Pressable
      accessibilityHint={footnote}
      accessibilityLabel={`${title} plan, ${price}. ${cadence}`}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.base, selected ? styles.selected : styles.unselected, pressed ? styles.pressed : null]}
    >
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{badge}</Text>
        </View>
      ) : null}
      <View style={styles.topRow}>
        <View style={styles.radio}>
          {selected ? <View style={styles.radioInner} /> : null}
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.cadence}>{cadence}</Text>
        </View>
        <MaterialCommunityIcons color={selected ? colors.plumDeep : colors.textSoft} name="star-four-points-circle-outline" size={24} />
      </View>
      <Text style={styles.price}>{price}</Text>
      <Text style={styles.footnote}>{footnote}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.sm,
    backgroundColor: colors.surfaceStrong,
    minWidth: 0,
    ...shadows.card,
  },
  selected: {
    borderColor: colors.plum,
    backgroundColor: '#FFF5FD',
  },
  unselected: {
    borderColor: colors.cardStroke,
  },
  pressed: {
    transform: [{ scale: 0.988 }],
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: '#F4E6FF',
  },
  badgeLabel: {
    color: colors.plumDeep,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.plum,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  cadence: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  price: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  footnote: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});

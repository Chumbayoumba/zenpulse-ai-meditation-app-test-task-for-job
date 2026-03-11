import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Entrance } from '../components/entrance';
import { MoodChip } from '../components/mood-chip';
import { PremiumButton } from '../components/premium-button';
import { moodOptions } from '../data/moods';
import { generateAffirmation, getAiModeLabel } from '../lib/ai';
import { colors, layout, radii, shadows, spacing, typography } from '../lib/theme';
import { MoodOption } from '../lib/types';
import { useZenPulse } from '../providers/zen-pulse-provider';

export default function AffirmationScreen() {
  const router = useRouter();
  const { lastAffirmation, storeAffirmation } = useZenPulse();
  const [selectedMood, setSelectedMood] = useState<MoodOption>('calm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const endpointLabel = getAiModeLabel();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateAffirmation(selectedMood);
      await storeAffirmation({
        mood: selectedMood,
        provider: result.provider,
        text: result.text,
        generatedAt: new Date().toISOString(),
      });

      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'The AI affirmation could not be generated.');
    } finally {
      setLoading(false);
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
              <Text style={styles.eyebrow}>AI Mood of the day</Text>
              <Text style={[styles.headerTitle, isCompact ? styles.headerTitleCompact : null]}>Pick your mood and let the app compose a live affirmation.</Text>
            </View>
          </View>
        </Entrance>

        <Entrance delay={100}>
          <View style={styles.providerChip}>
            <MaterialCommunityIcons color={colors.plumDeep} name="api" size={16} />
            <Text style={styles.providerLabel}>{endpointLabel}</Text>
          </View>
        </Entrance>

        <View accessibilityLabel="Mood options" accessibilityRole="radiogroup" style={styles.moodList}>
          {moodOptions.map((mood, index) => (
            <Entrance delay={140 + index * 50} key={mood.id}>
              <MoodChip
                emoji={mood.emoji}
                onPress={() => {
                  setSelectedMood(mood.id);
                  setError(null);
                  if (Platform.OS !== 'web') {
                    void Haptics.selectionAsync();
                  }
                }}
                selected={selectedMood === mood.id}
                subtitle={mood.subtitle}
                title={mood.title}
              />
            </Entrance>
          ))}
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <MaterialCommunityIcons color={colors.rose} name="alert-circle-outline" size={18} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Entrance delay={250}>
          <PremiumButton
            accessibilityHint="Generates a live affirmation and saves it for the home screen."
            loading={loading}
            onPress={handleGenerate}
            subtitle="Generated live, then saved back into your library."
            title="Generate today’s affirmation"
          />
        </Entrance>

        <Entrance delay={310}>
          <View style={styles.resultCard}>
            <Text style={styles.resultEyebrow}>Latest result</Text>
            <Text style={[styles.resultText, isCompact ? styles.resultTextCompact : null]}>
              {lastAffirmation?.text ??
                'No affirmation yet. Choose a mood above and generate one to store it locally for the home screen.'}
            </Text>
            <View style={styles.resultMetaRow}>
              <View style={styles.metaChip}>
                <MaterialCommunityIcons color={colors.textSoft} name="lightning-bolt-outline" size={16} />
                <Text style={styles.metaLabel}>{lastAffirmation?.provider ?? endpointLabel}</Text>
              </View>
              <View style={styles.metaChip}>
                <MaterialCommunityIcons color={colors.textSoft} name="heart-outline" size={16} />
                <Text style={styles.metaLabel}>{lastAffirmation?.mood ?? selectedMood}</Text>
              </View>
            </View>
          </View>
        </Entrance>

        <Text style={styles.footerText}>
          Dev mode will use a local proxy when available, then fall back to a public text model. For production, point `EXPO_PUBLIC_AI_ENDPOINT` to your own secured server endpoint.
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
  providerChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: '#F3EBFF',
  },
  providerLabel: {
    color: colors.plumDeep,
    fontSize: 12,
    fontWeight: '800',
  },
  moodList: {
    gap: spacing.md,
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
  resultCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.cardStroke,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.card,
  },
  resultEyebrow: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resultText: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  },
  resultTextCompact: {
    fontSize: 24,
    lineHeight: 31,
  },
  resultMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  footerText: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});

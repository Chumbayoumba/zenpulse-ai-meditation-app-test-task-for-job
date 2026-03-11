export type SubscriptionPlan = 'monthly' | 'yearly';

export type MoodOption = 'calm' | 'focus' | 'confidence';

export interface AffirmationResult {
  mood: MoodOption;
  text: string;
  provider: string;
  generatedAt: string;
}

export interface MeditationSession {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  premium: boolean;
  category: string;
  palette: readonly [string, string, string];
  themeLine: string;
  cues: readonly [string, string, string];
}

export interface MoodDefinition {
  id: MoodOption;
  emoji: string;
  title: string;
  subtitle: string;
}

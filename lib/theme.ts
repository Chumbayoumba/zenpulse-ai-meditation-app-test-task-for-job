import { Platform, TextStyle, ViewStyle } from 'react-native';

const displayFamily = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia',
});

export const colors = {
  background: '#F8EEF6',
  backgroundElevated: '#FFF7FB',
  surface: '#FFF9FD',
  surfaceStrong: '#FFFDFE',
  cardStroke: '#F1DCE7',
  text: '#35203A',
  textMuted: '#7D637F',
  textSoft: '#A586A0',
  rose: '#EC4899',
  plum: '#8B5CF6',
  plumDeep: '#6B3FD9',
  gold: '#F7C873',
  goldDeep: '#C48A2C',
  success: '#2E8B70',
  overlay: 'rgba(46, 24, 46, 0.58)',
  white: '#FFFFFF',
  black: '#180C17',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radii = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
};

export const typography = {
  hero: {
    fontFamily: displayFamily,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '700',
  } satisfies TextStyle,
  sectionTitle: {
    fontFamily: displayFamily,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  } satisfies TextStyle,
  cardTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  } satisfies TextStyle,
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  } satisfies TextStyle,
};

export const shadows = {
  card: {
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 10px 24px rgba(140, 95, 132, 0.12)' }
      : {
          shadowColor: '#8C5F84',
          shadowOpacity: 0.12,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 6,
        }),
  } satisfies ViewStyle,
  glow: {
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 12px 28px rgba(236, 72, 153, 0.18)' }
      : {
          shadowColor: '#EC4899',
          shadowOpacity: 0.18,
          shadowRadius: 28,
          shadowOffset: { width: 0, height: 12 },
          elevation: 10,
        }),
  } satisfies ViewStyle,
};

export const layout = {
  screenPadding: 20,
  contentGap: 18,
  cardGap: 16,
};

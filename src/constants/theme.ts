import { Platform, type ViewStyle } from 'react-native';

/** Shared Evolve app design tokens (Settings, Home, Notifications). */
export const colors = {
  primary: '#a42a8b',
  primaryDark: '#7a1f66',
  primaryLight: '#FAF2FF',
  primaryMuted: '#eecdf4',
  primarySoft: '#E8B4DC',
  background: '#F8F9FB',
  surface: '#FFFFFF',
  textPrimary: '#1a1a2e',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  link: '#a42a8b',
  accentOrange: '#FF9800',
  accentGreen: '#4CAF50',
  accentBlue: '#4A90E2',
  danger: '#F44336',
  heroOverlay: 'rgba(122, 31, 102, 0.72)',
  heroHighlight: '#eecdf4',
  noticeBackground: '#FAF2FF',
  noticeBorder: '#eecdf4',
  eventBackground: '#FAF2FF',
  eventBorder: '#eecdf4',
};

export const spacing = {
  screenHorizontal: 16,
  sectionGap: 24,
  cardRadius: 16,
};

/** Shared section headings (Home, Settings). */
export const sectionTitleStyle = {
  fontSize: 18,
  fontWeight: '700' as const,
  color: colors.textPrimary,
};

export const cardShadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: { elevation: 3 },
  default: {},
}) as ViewStyle;

export const cardShadowLight: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  android: { elevation: 2 },
  default: {},
}) as ViewStyle;

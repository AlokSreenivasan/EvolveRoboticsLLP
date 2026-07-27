import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/** Shared Evolve app design tokens — Home redesign is the source of truth. */
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
  /** Soft tints for status chips / accents (brand-aligned). */
  successLight: '#E8F5E9',
  warningLight: '#FFF3E0',
  dangerLight: '#FFEBEE',
  infoLight: '#E8F4FD',
  overlayScrim: 'rgba(26, 26, 46, 0.48)',
};

export const spacing = {
  screenHorizontal: 16,
  sectionGap: 24,
  cardRadius: 16,
  cardRadiusLg: 24,
  cardRadiusXl: 28,
  inputRadius: 14,
  buttonRadius: 16,
  chipRadius: 12,
  iconTileRadius: 14,
};

export const typography = {
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  } as TextStyle,
  screenSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 20,
  } as TextStyle,
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  } as TextStyle,
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  } as TextStyle,
  body: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 22,
  } as TextStyle,
  bodySecondary: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 18,
  } as TextStyle,
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  } as TextStyle,
  button: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.15,
  } as TextStyle,
};

/** Shared section headings (Home, Settings). */
export const sectionTitleStyle = typography.sectionTitle;

/** Soft surface elevation — cards, panels. */
export const cardShadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  android: { elevation: 4 },
  default: {},
}) as ViewStyle;

/** Lighter elevation — chips, compact rows. */
export const cardShadowLight: ViewStyle = Platform.select({
  ios: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  android: { elevation: 2 },
  default: {},
}) as ViewStyle;

/** Stronger lift — hero panels, floating chrome. */
export const cardShadowElevated: ViewStyle = Platform.select({
  ios: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
  },
  android: { elevation: 8 },
  default: {},
}) as ViewStyle;

/** Hairline glass border used on elevated white surfaces. */
export const glassBorder: ViewStyle = {
  borderWidth: Platform.OS === 'android' ? 1 : 0.5,
  borderColor: 'rgba(164, 42, 139, 0.12)',
};

/** Shared input field chrome. */
export const inputFieldStyle: ViewStyle = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: spacing.inputRadius,
  paddingHorizontal: 14,
  paddingVertical: 12,
  backgroundColor: colors.surface,
  ...glassBorder,
};

/** Primary CTA fill. */
export const primaryButtonStyle: ViewStyle = {
  backgroundColor: colors.primary,
  borderRadius: spacing.buttonRadius,
  paddingVertical: 14,
  paddingHorizontal: 18,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 52,
  ...cardShadowLight,
};

/** Secondary / outline CTA. */
export const secondaryButtonStyle: ViewStyle = {
  backgroundColor: colors.surface,
  borderRadius: spacing.buttonRadius,
  paddingVertical: 14,
  paddingHorizontal: 18,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 52,
  borderWidth: 1.5,
  borderColor: colors.primaryMuted,
};

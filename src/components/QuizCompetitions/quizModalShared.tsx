import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import AppButton from '../AppButton';
import SurfaceCard from '../ui/SurfaceCard';
import {
  colors,
  spacing,
  typography,
} from '../../constants/theme';

export type QuizModalHeroVariant =
  | 'perfect'
  | 'partial'
  | 'timeout'
  | 'locked'
  | 'completed'
  | 'error';

export type QuizScoreTone = 'success' | 'primary' | 'warning';

const HERO_GLOW_BY_VARIANT: Record<
  QuizModalHeroVariant,
  { top: string; bottom: string }
> = {
  perfect: {
    top: 'rgba(164, 42, 139, 0.18)',
    bottom: 'rgba(238, 205, 244, 0.22)',
  },
  completed: {
    top: 'rgba(255, 255, 255, 0.16)',
    bottom: 'rgba(255, 255, 255, 0.1)',
  },
  partial: {
    top: 'rgba(164, 42, 139, 0.12)',
    bottom: 'rgba(238, 205, 244, 0.24)',
  },
  timeout: {
    top: 'rgba(255, 152, 0, 0.14)',
    bottom: 'rgba(255, 152, 0, 0.08)',
  },
  locked: {
    top: 'rgba(107, 114, 128, 0.1)',
    bottom: 'rgba(229, 231, 235, 0.4)',
  },
  error: {
    top: 'rgba(244, 67, 54, 0.1)',
    bottom: 'rgba(244, 67, 54, 0.06)',
  },
};

const SCORE_TONE_STYLES: Record<
  QuizScoreTone,
  {
    panelBackground: string;
    panelBorder: string;
    trackBackground: string;
    fillColor: string;
  }
> = {
  success: {
    panelBackground: colors.successLight,
    panelBorder: 'rgba(76, 175, 80, 0.28)',
    trackBackground: 'rgba(76, 175, 80, 0.14)',
    fillColor: colors.accentGreen,
  },
  primary: {
    panelBackground: colors.noticeBackground,
    panelBorder: colors.noticeBorder,
    trackBackground: colors.primaryLight,
    fillColor: colors.primary,
  },
  warning: {
    panelBackground: colors.warningLight,
    panelBorder: 'rgba(255, 152, 0, 0.28)',
    trackBackground: 'rgba(255, 152, 0, 0.12)',
    fillColor: colors.accentOrange,
  },
};

type QuizModalShellProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

type QuizModalHeroProps = {
  variant: QuizModalHeroVariant;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  iconColor: string;
};

type QuizModalBadgeProps = {
  icon: React.ReactNode;
  label: string;
  tone?: 'default' | 'success' | 'warning' | 'muted';
};

type QuizModalActionProps = {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'danger';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

type QuizModalSecondaryActionProps = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

type QuizModalActionStackProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function QuizModalShell({
  visible,
  onClose,
  children,
}: QuizModalShellProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <SurfaceCard elevation="elevated" clipped style={styles.card}>
          <Pressable onPress={event => event.stopPropagation()}>
            {children}
          </Pressable>
        </SurfaceCard>
      </Pressable>
    </Modal>
  );
}

export function QuizModalHero({
  variant,
  title,
  subtitle,
  Icon,
  iconColor,
}: QuizModalHeroProps) {
  const heroStyle =
    variant === 'perfect'
      ? styles.heroPerfect
      : variant === 'partial'
        ? styles.heroPartial
        : variant === 'timeout'
          ? styles.heroTimeout
          : variant === 'locked'
            ? styles.heroLocked
            : variant === 'completed'
              ? styles.heroCompleted
              : styles.heroError;

  const iconWrapStyle =
    variant === 'perfect'
      ? styles.heroIconWrapPerfect
      : variant === 'partial'
        ? styles.heroIconWrapPartial
        : variant === 'timeout'
          ? styles.heroIconWrapTimeout
          : variant === 'locked'
            ? styles.heroIconWrapLocked
            : variant === 'completed'
              ? styles.heroIconWrapCompleted
              : styles.heroIconWrapError;

  const titleLight = variant === 'perfect' || variant === 'completed';
  const glow = HERO_GLOW_BY_VARIANT[variant];

  return (
    <View style={[styles.hero, heroStyle]}>
      <View style={[styles.heroGlowTop, { backgroundColor: glow.top }]} />
      <View style={[styles.heroGlowBottom, { backgroundColor: glow.bottom }]} />
      <View style={[styles.heroIconWrap, iconWrapStyle]}>
        <Icon size={28} color={iconColor} strokeWidth={2.25} />
      </View>
      <Text style={[styles.heroTitle, titleLight && styles.heroTitleLight]}>
        {title}
      </Text>
      <Text
        style={[styles.heroSubtitle, titleLight && styles.heroSubtitleLight]}>
        {subtitle}
      </Text>
    </View>
  );
}

export function QuizModalBadge({
  icon,
  label,
  tone = 'default',
}: QuizModalBadgeProps) {
  const badgeStyle =
    tone === 'success'
      ? styles.badgeSuccess
      : tone === 'warning'
        ? styles.badgeWarning
        : tone === 'muted'
          ? styles.badgeMuted
          : styles.badgeDefault;

  const textStyle =
    tone === 'success'
      ? styles.badgeTextSuccess
      : tone === 'warning'
        ? styles.badgeTextWarning
        : tone === 'muted'
          ? styles.badgeTextMuted
          : styles.badgeText;

  return (
    <View style={[styles.badge, badgeStyle]}>
      {icon}
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

type QuizModalScorePanelProps = {
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  tone?: QuizScoreTone;
};

type QuizModalInsightChipProps = {
  label: string;
  tone?: 'success' | 'muted' | 'warning';
};

export function QuizModalScorePanel({
  correctCount,
  totalQuestions,
  percentage,
  tone = 'primary',
}: QuizModalScorePanelProps) {
  const toneStyle = SCORE_TONE_STYLES[tone];
  const clampedPercent = Math.min(100, Math.max(0, percentage));
  const progressWidth = clampedPercent > 0 ? Math.max(4, clampedPercent) : 0;

  return (
    <View
      style={[
        styles.scorePanel,
        {
          backgroundColor: toneStyle.panelBackground,
          borderColor: toneStyle.panelBorder,
        },
      ]}>
      <Text style={styles.statValue}>
        {correctCount}/{totalQuestions}
      </Text>
      <Text style={styles.statLabel}>{percentage}% score</Text>

      <View
        style={[
          styles.scoreProgressTrack,
          { backgroundColor: toneStyle.trackBackground },
        ]}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: clampedPercent,
        }}>
        <View
          style={[
            styles.scoreProgressFill,
            {
              width: `${progressWidth}%`,
              backgroundColor: toneStyle.fillColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

export function QuizModalInsightChip({
  label,
  tone = 'muted',
}: QuizModalInsightChipProps) {
  const chipStyle =
    tone === 'success'
      ? styles.insightChipSuccess
      : tone === 'warning'
        ? styles.insightChipWarning
        : styles.insightChipMuted;

  const textStyle =
    tone === 'success'
      ? styles.insightChipTextSuccess
      : tone === 'warning'
        ? styles.insightChipTextWarning
        : styles.insightChipTextMuted;

  return (
    <View style={[styles.insightChip, chipStyle]}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

export function QuizModalAction({
  label,
  onPress,
  tone = 'primary',
  style,
  disabled = false,
}: QuizModalActionProps) {
  return (
    <AppButton
      title={label}
      onPress={onPress}
      variant={tone === 'danger' ? 'danger' : 'primary'}
      buttonStyle={[styles.actionButton, style]}
      disabled={disabled}
    />
  );
}

export function QuizModalSecondaryAction({
  label,
  onPress,
  style,
  disabled = false,
}: QuizModalSecondaryActionProps) {
  return (
    <AppButton
      title={label}
      onPress={onPress}
      variant="secondary"
      buttonStyle={[styles.actionButton, style]}
      disabled={disabled}
    />
  );
}

export function QuizModalActionStack({
  children,
  style,
}: QuizModalActionStackProps) {
  return <View style={[styles.actionStack, style]}>{children}</View>;
}

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlayScrim,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenHorizontal,
  },
  card: {
    backgroundColor: colors.surface,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  heroPerfect: {
    backgroundColor: colors.primaryDark,
  },
  heroPartial: {
    backgroundColor: colors.primaryLight,
  },
  heroTimeout: {
    backgroundColor: colors.warningLight,
  },
  heroLocked: {
    backgroundColor: colors.background,
  },
  heroCompleted: {
    backgroundColor: colors.accentGreen,
  },
  heroError: {
    backgroundColor: colors.dangerLight,
  },
  heroGlowTop: {
    position: 'absolute',
    top: -36,
    left: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  heroGlowBottom: {
    position: 'absolute',
    bottom: -40,
    right: -16,
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroIconWrapPerfect: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroIconWrapPartial: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  heroIconWrapTimeout: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.28)',
  },
  heroIconWrapLocked: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroIconWrapCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
  },
  heroIconWrapError: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.28)',
  },
  heroTitle: {
    ...typography.screenTitle,
    fontSize: 22,
    textAlign: 'center',
  },
  heroTitleLight: {
    color: '#fff',
  },
  heroSubtitle: {
    ...typography.screenSubtitle,
    marginTop: 4,
    textAlign: 'center',
  },
  heroSubtitleLight: {
    color: 'rgba(255, 255, 255, 0.88)',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    alignItems: 'center',
  },
  message: {
    ...typography.bodySecondary,
    textAlign: 'center',
    marginBottom: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: spacing.chipRadius,
    borderWidth: 1,
  },
  badgeDefault: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryMuted,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.28)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderColor: 'rgba(255, 152, 0, 0.28)',
  },
  badgeMuted: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  badgeTextSuccess: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentGreen,
  },
  badgeTextWarning: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentOrange,
  },
  badgeTextMuted: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  scorePanel: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    marginBottom: 14,
  },
  scoreProgressTrack: {
    alignSelf: 'stretch',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 12,
  },
  scoreProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  insightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  insightChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: spacing.chipRadius,
    borderWidth: 1,
  },
  insightChipSuccess: {
    backgroundColor: colors.successLight,
    borderColor: 'rgba(76, 175, 80, 0.28)',
  },
  insightChipWarning: {
    backgroundColor: colors.warningLight,
    borderColor: 'rgba(255, 152, 0, 0.28)',
  },
  insightChipMuted: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  insightChipTextSuccess: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentGreen,
  },
  insightChipTextWarning: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentOrange,
  },
  insightChipTextMuted: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 32,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  actionStack: {
    alignSelf: 'stretch',
    width: '100%',
    gap: 10,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
});

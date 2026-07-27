import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import {
  colors,
  spacing,
  typography,
} from '../../constants/theme';
import SurfaceCard from './SurfaceCard';
import { SkeletonCard } from './Skeleton';

export type ScreenStateVariant = 'loading' | 'empty' | 'error' | 'success';

type ScreenStateCardProps = {
  variant?: ScreenStateVariant;
  title?: string;
  message?: string;
  Icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const VARIANT_ICON_BG: Record<ScreenStateVariant, string> = {
  loading: colors.primaryLight,
  empty: colors.primaryLight,
  error: colors.dangerLight,
  success: colors.successLight,
};

const VARIANT_ICON_COLOR: Record<ScreenStateVariant, string> = {
  loading: colors.primary,
  empty: colors.primary,
  error: colors.danger,
  success: colors.accentGreen,
};

/**
 * Shared empty / error / loading / success panel for list and detail screens.
 */
function ScreenStateCard({
  variant = 'empty',
  title,
  message,
  Icon,
  style,
  children,
}: ScreenStateCardProps) {
  if (variant === 'loading') {
    return (
      <View style={[styles.loadingWrap, style]}>
        <SkeletonCard />
        <SkeletonCard style={styles.loadingSecond} />
      </View>
    );
  }

  return (
    <SurfaceCard elevation="light" style={[styles.card, style]}>
      {Icon ? (
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: VARIANT_ICON_BG[variant] },
          ]}>
          <Icon
            size={22}
            color={VARIANT_ICON_COLOR[variant]}
            strokeWidth={2.25}
          />
        </View>
      ) : null}

      {title ? <Text style={styles.title}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {children}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    gap: 12,
  },
  loadingSecond: {
    opacity: 0.72,
  },
  card: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: spacing.iconTileRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    ...typography.cardTitle,
    fontSize: 16,
    textAlign: 'center',
  },
  message: {
    ...typography.bodySecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default ScreenStateCard;

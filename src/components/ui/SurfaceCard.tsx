import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  cardShadow,
  cardShadowElevated,
  cardShadowLight,
  colors,
  glassBorder,
  spacing,
} from '../../constants/theme';

export type SurfaceCardElevation = 'flat' | 'light' | 'default' | 'elevated';

type SurfaceCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: SurfaceCardElevation;
  /** Soft lilac tint used for notices / highlighted panels. */
  tinted?: boolean;
  /** Clip children to rounded corners. */
  clipped?: boolean;
};

function elevationStyle(elevation: SurfaceCardElevation): ViewStyle {
  switch (elevation) {
    case 'flat':
      return {};
    case 'light':
      return cardShadowLight;
    case 'elevated':
      return cardShadowElevated;
    case 'default':
    default:
      return cardShadow;
  }
}

/**
 * Premium elevated surface used across Home, Settings, lists, and Admin.
 */
function SurfaceCard({
  children,
  style,
  elevation = 'default',
  tinted = false,
  clipped = false,
}: SurfaceCardProps) {
  const surfaceStyle = [
    styles.card,
    tinted && styles.tinted,
    clipped && styles.clipped,
  ];

  if (elevation === 'flat') {
    return <View style={[...surfaceStyle, style]}>{children}</View>;
  }

  return (
    <View style={[styles.shadowShell, elevationStyle(elevation), style]}>
      <View style={surfaceStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowShell: {
    borderRadius: spacing.cardRadiusLg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadiusLg,
    overflow: 'hidden',
    ...glassBorder,
  },
  tinted: {
    backgroundColor: colors.noticeBackground,
    borderColor: colors.noticeBorder,
  },
  clipped: {
    overflow: 'hidden',
  },
});

export default SurfaceCard;

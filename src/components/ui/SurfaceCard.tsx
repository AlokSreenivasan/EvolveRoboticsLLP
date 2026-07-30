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
import { splitSurfaceStyle } from '../../utils/ui/splitSurfaceStyle';

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
 *
 * Shadow lives on an outer shell; padding / borders live on the inner surface
 * so elevation never draws a larger rectangular frame around inset content.
 */
function SurfaceCard({
  children,
  style,
  elevation = 'default',
  tinted = false,
  clipped = false,
}: SurfaceCardProps) {
  if (elevation === 'flat') {
    return (
      <View
        style={[
          styles.card,
          tinted && styles.tinted,
          clipped && styles.clipped,
          style,
        ]}>
        {children}
      </View>
    );
  }

  const { shell, content } = splitSurfaceStyle(style);

  return (
    <View
      style={[
        styles.shadowShell,
        tinted ? styles.tintedShell : styles.surfaceShell,
        elevationStyle(elevation),
        shell,
      ]}>
      <View
        style={[
          styles.card,
          tinted && styles.tinted,
          clipped && styles.clipped,
          content,
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowShell: {
    borderRadius: spacing.cardRadiusLg,
  },
  surfaceShell: {
    backgroundColor: colors.surface,
  },
  tintedShell: {
    backgroundColor: colors.noticeBackground,
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

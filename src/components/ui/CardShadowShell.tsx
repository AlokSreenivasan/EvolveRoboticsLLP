import React from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewProps,
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

export type CardShadowElevation = 'none' | 'light' | 'default' | 'elevated';

type CardShadowShellProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  elevation?: CardShadowElevation;
  borderRadius?: number;
  /** Skip the default glass border on the inner surface. */
  borderless?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
} & Pick<ViewProps, 'accessibilityRole' | 'accessibilityLabel'>;

function elevationStyle(elevation: CardShadowElevation): ViewStyle {
  switch (elevation) {
    case 'none':
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
 * Renders shadow on an outer shell and clips content on an inner surface so
 * iOS/Android shadows follow rounded corners instead of being cut off or
 * drawing a larger rectangular frame around inset padding.
 */
function CardShadowShell({
  children,
  style,
  innerStyle,
  elevation = 'default',
  borderRadius = spacing.cardRadiusLg,
  borderless = false,
  onLayout,
  accessibilityRole,
  accessibilityLabel,
}: CardShadowShellProps) {
  const radiusStyle = { borderRadius };
  const { shell, content } = splitSurfaceStyle(style);
  const flatInner = (StyleSheet.flatten(innerStyle) ?? {}) as ViewStyle;
  const shellBackground =
    flatInner.backgroundColor ?? shell.backgroundColor ?? colors.surface;

  return (
    <View
      style={[
        radiusStyle,
        { backgroundColor: shellBackground },
        elevation !== 'none' && elevationStyle(elevation),
        shell,
      ]}
      onLayout={onLayout}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}>
      <View
        style={[
          styles.inner,
          !borderless && styles.innerBordered,
          radiusStyle,
          content,
          innerStyle,
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  innerBordered: {
    ...glassBorder,
  },
});

export default CardShadowShell;

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
 * iOS/Android shadows follow rounded corners instead of being cut off.
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

  return (
    <View
      style={[radiusStyle, elevationStyle(elevation), style]}
      onLayout={onLayout}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}>
      <View
        style={[
          styles.inner,
          !borderless && styles.innerBordered,
          radiusStyle,
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

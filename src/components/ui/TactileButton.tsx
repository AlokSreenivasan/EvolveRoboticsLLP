import React from 'react';
import {
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  buttonVariants,
  spacing,
  type ButtonVariantName,
} from '../../constants/theme';
import { splitSurfaceStyle } from '../../utils/ui/splitSurfaceStyle';

export type TactileButtonProps = {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariantName;
  /**
   * Layout props (margins, flex, width, minHeight) apply to the outer footprint;
   * everything else (padding, radius, colors) applies to the pressable face.
   */
  style?: StyleProp<ViewStyle>;
  faceColor?: string;
  /** Used as the pressed fill. Kept for call-site compatibility. */
  edgeColor?: string;
  borderColor?: string;
  borderRadius?: number;
  /** @deprecated Flat buttons ignore depth; kept for call-site compatibility. */
  depth?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  busy?: boolean;
  hitSlop?: PressableProps['hitSlop'];
  testID?: string;
};

/**
 * Flat pressable button with ripple / fill feedback.
 * `faceColor` / `edgeColor` map to idle and pressed fills.
 */
function TactileButton({
  children,
  onPress,
  variant = 'primary',
  style,
  faceColor,
  edgeColor,
  borderColor,
  borderRadius,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  busy = false,
  hitSlop,
  testID,
}: TactileButtonProps) {
  const palette = buttonVariants[variant];
  const { shell, content } = splitSurfaceStyle(style);
  const radius =
    borderRadius ??
    (typeof content.borderRadius === 'number'
      ? content.borderRadius
      : spacing.buttonRadius);
  const idleFill =
    faceColor ??
    (typeof content.backgroundColor === 'string'
      ? content.backgroundColor
      : undefined) ??
    palette.face;
  const pressedFill = edgeColor ?? palette.edge;
  const resolvedBorder = borderColor ?? palette.border;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        shell,
        content,
        {
          borderRadius: radius,
          backgroundColor: pressed && !disabled ? pressedFill : idleFill,
          borderColor: resolvedBorder,
        },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      android_ripple={
        disabled
          ? undefined
          : {
              color: 'rgba(0, 0, 0, 0.1)',
              borderless: false,
            }
      }
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy }}
      testID={testID}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.55,
  },
});

export default React.memo(TactileButton);

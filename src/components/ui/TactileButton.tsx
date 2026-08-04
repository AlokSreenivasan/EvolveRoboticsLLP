import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  buttonDepth,
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
  edgeColor?: string;
  borderColor?: string;
  borderRadius?: number;
  depth?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  busy?: boolean;
  hitSlop?: PressableProps['hitSlop'];
  testID?: string;
};

const DEFAULT_FACE_PADDING_VERTICAL = 12;

function resolvePadding(...values: ViewStyle[keyof ViewStyle][]): number {
  const match = values.find(value => typeof value === 'number');
  return typeof match === 'number' ? match : DEFAULT_FACE_PADDING_VERTICAL;
}

/**
 * Buttons sized by their own content grow by the edge's height unless the face
 * gives that space back, so trim it off the face's vertical padding. Buttons
 * with an explicit height already absorb the edge and are left alone.
 */
function faceHeightCompensation(
  footprint: ViewStyle,
  content: ViewStyle,
  depth: number,
): ViewStyle | null {
  if (footprint.minHeight !== undefined || footprint.height !== undefined) {
    return null;
  }

  const top = resolvePadding(
    content.paddingTop,
    content.paddingVertical,
    content.padding,
  );
  const bottom = resolvePadding(
    content.paddingBottom,
    content.paddingVertical,
    content.padding,
  );

  return {
    paddingTop: Math.max(0, top - depth / 2),
    paddingBottom: Math.max(0, bottom - depth / 2),
  };
}

/**
 * Button whose face rests on a darker bottom edge and drops onto it when
 * pressed. The edge is carved out of the button's own height rather than added
 * to it, so swapping a flat button for this one never shifts layout.
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
  depth = buttonDepth,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  busy = false,
  hitSlop,
  testID,
}: TactileButtonProps) {
  const palette = buttonVariants[variant];
  const { shell, content } = splitSurfaceStyle(style);
  // splitSurfaceStyle mirrors backgroundColor onto the shell for shadow fills;
  // here the shell has to stay the edge color.
  const footprint: ViewStyle = { ...shell };
  delete footprint.backgroundColor;
  const radius =
    borderRadius ??
    (typeof content.borderRadius === 'number'
      ? content.borderRadius
      : spacing.buttonRadius);

  return (
    <Pressable
      style={[
        footprint,
        {
          borderRadius: radius,
          paddingBottom: depth,
          backgroundColor: edgeColor ?? palette.edge,
        },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy }}
      testID={testID}>
      {({ pressed }) => (
        <View
          style={[
            styles.face,
            {
              borderRadius: radius,
              backgroundColor: faceColor ?? palette.face,
              borderColor: borderColor ?? palette.border,
            },
            content,
            faceHeightCompensation(footprint, content, depth),
            pressed && { transform: [{ translateY: depth }] },
          ]}>
          {children}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  face: {
    // Fill the footprint minus the edge, without stealing width from parents
    // that center-align the button (flexGrow alone can collapse to ~0 width).
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  disabled: {
    opacity: 0.55,
  },
});

export default React.memo(TactileButton);

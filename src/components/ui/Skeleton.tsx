import React, { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, spacing } from '../../constants/theme';

type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Soft shimmer placeholder for loading states.
 */
function Skeleton({
  width = '100%',
  height = 14,
  borderRadius = spacing.chipRadius,
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

type SkeletonCardProps = {
  style?: StyleProp<ViewStyle>;
};

function SkeletonCard({ style }: SkeletonCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width={48} height={48} borderRadius={14} />
      <View style={styles.lines}>
        <Skeleton width="72%" height={14} />
        <Skeleton width="92%" height={12} />
        <Skeleton width="54%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.primaryMuted,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: spacing.cardRadiusLg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(164, 42, 139, 0.12)',
  },
  lines: {
    flex: 1,
    gap: 8,
  },
});

export { Skeleton, SkeletonCard };
export default Skeleton;

import React, { useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, spacing } from '../constants/theme';

const SEGMENT_INACTIVE_WIDTH = 10;
const SEGMENT_ACTIVE_WIDTH = 26;
const SEGMENT_HEIGHT = 4;
const SEGMENT_ACTIVE_HEIGHT = 5;

type PaginationVariant = 'light' | 'dark';

type ExpandingDotPaginationProps = {
  total: number;
  activeIndex: number;
  variant?: PaginationVariant;
  showLabel?: boolean;
  onDotPress?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
};

type PaginationSegmentProps = {
  index: number;
  isActive: boolean;
  variant: PaginationVariant;
  onPress?: () => void;
};

function PaginationSegment({
  index,
  isActive,
  variant,
  onPress,
}: PaginationSegmentProps) {
  const isDark = variant === 'dark';
  const inactiveColor = isDark
    ? 'rgba(255,255,255,0.28)'
    : colors.primaryMuted;
  const activeColor = colors.primary;

  const width = useSharedValue(
    isActive ? SEGMENT_ACTIVE_WIDTH : SEGMENT_INACTIVE_WIDTH,
  );
  const height = useSharedValue(
    isActive ? SEGMENT_ACTIVE_HEIGHT : SEGMENT_HEIGHT,
  );
  const borderRadius = useSharedValue(isActive ? 3 : 2);

  useEffect(() => {
    width.value = withTiming(
      isActive ? SEGMENT_ACTIVE_WIDTH : SEGMENT_INACTIVE_WIDTH,
      { duration: 200 },
    );
    height.value = withTiming(
      isActive ? SEGMENT_ACTIVE_HEIGHT : SEGMENT_HEIGHT,
      { duration: 200 },
    );
    borderRadius.value = withTiming(isActive ? 3 : 2, { duration: 200 });
  }, [isActive, width, height, borderRadius]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    height: height.value,
    borderRadius: borderRadius.value,
  }));

  const segment = (
    <Animated.View
      style={[
        styles.segment,
        animatedStyle,
        {
          backgroundColor: isActive ? activeColor : inactiveColor,
        },
        isActive && isDark && styles.segmentActiveGlow,
      ]}
    />
  );

  if (!onPress) {
    return segment;
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={`Go to slide ${index + 1}`}
      accessibilityState={{ selected: isActive }}>
      {segment}
    </Pressable>
  );
}

function ExpandingDotPagination({
  total,
  activeIndex,
  variant = 'light',
  showLabel = true,
  onDotPress,
  style,
}: ExpandingDotPaginationProps) {
  const isDark = variant === 'dark';

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.rail,
          isDark ? styles.railDark : styles.railLight,
        ]}>
        {Array.from({ length: total }, (_, index) => (
          <PaginationSegment
            key={index}
            index={index}
            isActive={index === activeIndex}
            variant={variant}
            onPress={
              onDotPress ? () => onDotPress(index) : undefined
            }
          />
        ))}
      </View>

      {showLabel ? (
        <Text style={[styles.stepLabel, isDark && styles.stepLabelDark]}>
          <Text
            style={[
              styles.stepCurrent,
              isDark && styles.stepCurrentDark,
            ]}>
            {activeIndex + 1}
          </Text>
          <Text
            style={[styles.stepDivider, isDark && styles.stepDividerDark]}>
            {' '}
            of {total}
          </Text>
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 10,
  },
  rail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: spacing.cardRadius,
  },
  railLight: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  railDark: {
    backgroundColor: 'rgba(122, 31, 102, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(238, 205, 244, 0.28)',
  },
  segment: {
    borderRadius: 2,
  },
  segmentActiveGlow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 6,
    elevation: 4,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  stepLabelDark: {
    color: 'rgba(255,255,255,0.5)',
  },
  stepCurrent: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  stepCurrentDark: {
    color: colors.heroHighlight,
  },
  stepDivider: {
    color: colors.textMuted,
    fontWeight: '500',
  },
  stepDividerDark: {
    color: 'rgba(255,255,255,0.42)',
  },
});

export default ExpandingDotPagination;

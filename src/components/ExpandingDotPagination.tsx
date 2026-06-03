import React, { useEffect } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

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

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

  const segment = (
    <View
      style={[
        styles.segment,
        {
          width: isActive ? SEGMENT_ACTIVE_WIDTH : SEGMENT_INACTIVE_WIDTH,
          height: isActive ? SEGMENT_ACTIVE_HEIGHT : SEGMENT_HEIGHT,
          backgroundColor: isActive ? activeColor : inactiveColor,
          borderRadius: isActive ? 3 : 2,
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

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [activeIndex]);

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

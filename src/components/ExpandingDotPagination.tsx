import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '../constants/theme';

const DOT_HEIGHT = 8;
const DOT_RADIUS = DOT_HEIGHT / 2;

type PaginationVariant = 'light' | 'dark';

type ExpandingDotPaginationProps = {
  total: number;
  activeIndex: number;
  variant?: PaginationVariant;
  showLabel?: boolean;
  onDotPress?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
};

type PaginationDotProps = {
  index: number;
  isActive: boolean;
  variant: PaginationVariant;
  onPress?: () => void;
};

function activeWidth(variant: PaginationVariant) {
  return variant === 'dark' ? 28 : 18;
}

function PaginationDot({ index, isActive, variant, onPress }: PaginationDotProps) {
  const dotColor =
    variant === 'dark'
      ? isActive
        ? colors.primary
        : 'rgba(255,255,255,0.4)'
      : isActive
        ? colors.primary
        : colors.primaryMuted;

  const dot = (
    <View
      style={[
        styles.dot,
        {
          width: isActive ? activeWidth(variant) : 8,
          height: DOT_HEIGHT,
          backgroundColor: dotColor,
        },
      ]}
    />
  );

  if (!onPress) {
    return dot;
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Go to slide ${index + 1}`}
      accessibilityState={{ selected: isActive }}>
      {dot}
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
    <View style={[styles.row, style]}>
      <View
        style={[
          styles.track,
          isDark ? styles.trackDark : styles.trackLight,
        ]}>
        {Array.from({ length: total }, (_, index) => (
          <PaginationDot
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
        <Text style={[styles.label, isDark && styles.labelDark]}>
          <Text style={[styles.labelActive, isDark && styles.labelActiveDark]}>
            {String(activeIndex + 1).padStart(2, '0')}
          </Text>
          <Text style={[styles.labelSep, isDark && styles.labelSepDark]}>
            {' '}
            / {String(total).padStart(2, '0')}
          </Text>
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  trackLight: {
    backgroundColor: colors.primaryLight,
  },
  trackDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(238, 205, 244, 0.22)',
  },
  dot: {
    borderRadius: DOT_RADIUS,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 44,
  },
  labelDark: {
    color: 'rgba(255,255,255,0.55)',
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  labelActiveDark: {
    color: colors.heroHighlight,
  },
  labelSep: {
    color: colors.textMuted,
    fontWeight: '500',
  },
  labelSepDark: {
    color: 'rgba(255,255,255,0.45)',
  },
});

export default ExpandingDotPagination;

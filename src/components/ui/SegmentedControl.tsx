import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  cardShadowLight,
  colors,
  glassBorder,
} from '../../constants/theme';

export type SegmentedOption<T extends string> = {
  key: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (key: T) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Elevated segmented control matching Home floating chrome language.
 */
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  return (
    <View style={[styles.track, style]}>
      {options.map(option => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.key)}
            style={({ pressed }) => [
              styles.segment,
              active && styles.segmentActive,
              pressed && styles.segmentPressed,
            ]}>
            <Text
              style={[styles.label, active && styles.labelActive]}
              numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 4,
    gap: 4,
    ...glassBorder,
    ...cardShadowLight,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  segmentActive: {
    backgroundColor: colors.primaryLight,
  },
  segmentPressed: {
    opacity: 0.88,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
});

export default SegmentedControl;

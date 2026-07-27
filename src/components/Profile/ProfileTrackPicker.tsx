import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  cardShadowLight,
  colors,
  glassBorder,
  spacing,
  typography,
} from '../../constants/theme';
import type { CourseTrack } from '../../store/content/types/courses.types';

const TRACK_OPTIONS: ReadonlyArray<{
  value: CourseTrack;
  label: string;
}> = [
  { value: 'kids', label: 'Kids' },
  { value: 'professionals', label: 'Professional' },
];

type ProfileTrackPickerProps = {
  selectedTrack: CourseTrack | null;
  onSelectTrack: (track: CourseTrack) => void;
  disabled?: boolean;
  hasError?: boolean;
};

function ProfileTrackPicker({
  selectedTrack,
  onSelectTrack,
  disabled = false,
  hasError = false,
}: ProfileTrackPickerProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Learning Track</Text>
      <View style={styles.row}>
        {TRACK_OPTIONS.map(option => {
          const selected = selectedTrack === option.value;

          return (
            <Pressable
              key={option.value}
              style={[
                styles.option,
                selected ? styles.optionSelected : null,
                hasError && !selected ? styles.optionError : null,
                disabled ? styles.optionDisabled : null,
              ]}
              onPress={() => onSelectTrack(option.value)}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={option.label}>
              <Text
                style={[
                  styles.optionLabel,
                  selected ? styles.optionLabelSelected : null,
                ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
  },
  label: {
    ...typography.label,
    color: colors.primary,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: spacing.inputRadius,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    ...glassBorder,
    ...cardShadowLight,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionError: {
    borderColor: colors.danger,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default ProfileTrackPicker;

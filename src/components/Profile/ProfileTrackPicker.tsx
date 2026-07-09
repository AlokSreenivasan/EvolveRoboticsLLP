import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eecdf4',
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#a42a8b',
    backgroundColor: '#FAF2FF',
  },
  optionError: {
    borderColor: '#e57373',
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  optionLabelSelected: {
    color: '#a42a8b',
  },
});

export default ProfileTrackPicker;

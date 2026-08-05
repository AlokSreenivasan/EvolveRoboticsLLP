import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';
import {
  COURSE_TRACK_OPTIONS,
  type CourseTrack,
} from '../../store/content/types/courses.types';
import { adminStyles } from './adminStyles';

type AdminCourseTrackPickerProps = {
  value: CourseTrack | null;
  onChange: (track: CourseTrack) => void;
  label?: string;
  hint?: string;
  error?: boolean;
};

function AdminCourseTrackPicker({
  value,
  onChange,
  label = 'Course track *',
  hint = 'Required. Choose whether this course is listed under For Kids or For Professionals.',
  error = false,
}: AdminCourseTrackPickerProps) {
  return (
    <View style={[styles.wrap, error ? adminStyles.sectionError : null]}>
      <Text style={adminStyles.fieldLabel}>{label}</Text>
      <Text style={adminStyles.sectionHint}>{hint}</Text>
      {error ? (
        <Text style={adminStyles.fieldErrorHint}>Select kids or professionals.</Text>
      ) : null}

      <View style={styles.optionList}>
        {COURSE_TRACK_OPTIONS.map(option => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.option,
                selected ? styles.optionSelected : null,
                error && !selected ? styles.optionError : null,
              ]}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}>
              <Text
                style={[
                  styles.optionLabel,
                  selected ? styles.optionLabelSelected : null,
                ]}>
                {option.label}
              </Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  optionList: {
    gap: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionError: {
    borderColor: colors.danger,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});

export default AdminCourseTrackPicker;

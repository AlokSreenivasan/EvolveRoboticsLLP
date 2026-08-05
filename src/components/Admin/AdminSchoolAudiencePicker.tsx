import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Check } from 'lucide-react-native';

import { adminStyles } from './adminStyles';
import { resolveGradeOptionsForSchool } from '../../constants/gradeOptions';
import { colors } from '../../constants/theme';
import type { School } from '../../store/content/types/schools.types';
import type {
  SchoolAudience,
  SchoolGradeIdsMap,
} from '../../store/content/types/schoolAudience.types';

type AdminSchoolAudiencePickerProps = {
  audience: SchoolAudience;
  selectedSchoolIds: string[];
  schoolGradeIds: SchoolGradeIdsMap;
  schools: School[];
  schoolsLoading?: boolean;
  schoolsError?: string | null;
  label?: string;
  hint?: string;
  error?: boolean;
  onAudienceChange: (audience: SchoolAudience) => void;
  onToggleSchool: (schoolId: string) => void;
  onSchoolGradeModeChange: (schoolId: string, mode: 'all' | 'grades') => void;
  onToggleSchoolGrade: (schoolId: string, gradeId: string) => void;
  getSchoolGradeMode: (schoolId: string) => 'all' | 'grades';
};

function AdminSchoolAudiencePicker({
  audience,
  selectedSchoolIds,
  schoolGradeIds,
  schools,
  schoolsLoading = false,
  schoolsError = null,
  label = 'Audience',
  hint = 'Send to all schools, specific schools, or limit grades within each school.',
  error = false,
  onAudienceChange,
  onToggleSchool,
  onSchoolGradeModeChange,
  onToggleSchoolGrade,
  getSchoolGradeMode,
}: AdminSchoolAudiencePickerProps) {
  return (
    <View style={[styles.wrap, error ? adminStyles.sectionError : null]}>
      <Text style={adminStyles.fieldLabel}>{label}</Text>
      <Text style={adminStyles.sectionHint}>{hint}</Text>
      {error ? (
        <Text style={adminStyles.fieldErrorHint}>
          Complete school visibility before saving.
        </Text>
      ) : null}

      <View style={styles.modeRow}>
        <Pressable
          style={[
            styles.modeChip,
            audience === 'all' ? styles.modeChipActive : null,
            error ? styles.modeChipError : null,
          ]}
          onPress={() => onAudienceChange('all')}
          accessibilityRole="button"
          accessibilityState={{ selected: audience === 'all' }}>
          <Text
            style={[
              styles.modeChipText,
              audience === 'all' ? styles.modeChipTextActive : null,
            ]}>
            All schools
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.modeChip,
            audience === 'schools' ? styles.modeChipActive : null,
            error ? styles.modeChipError : null,
          ]}
          onPress={() => onAudienceChange('schools')}
          accessibilityRole="button"
          accessibilityState={{ selected: audience === 'schools' }}>
          <Text
            style={[
              styles.modeChipText,
              audience === 'schools' ? styles.modeChipTextActive : null,
            ]}>
            Selected schools
          </Text>
        </Pressable>
      </View>

      {audience === 'schools' ? (
        <View style={styles.schoolList}>
          {schoolsLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : schoolsError ? (
            <Text style={styles.errorText}>{schoolsError}</Text>
          ) : schools.length === 0 ? (
            <Text style={styles.emptyText}>
              No schools registered yet. Add schools under Admin → Add Schools.
            </Text>
          ) : (
            schools.map(school => {
              const selected = selectedSchoolIds.includes(school.id);
              const city = school.city.trim();
              const gradeMode = getSchoolGradeMode(school.id);
              const selectedGrades = schoolGradeIds[school.id] ?? [];

              return (
                <View key={school.id}>
                  <Pressable
                    style={[
                      styles.schoolRow,
                      selected ? styles.schoolRowSelected : null,
                    ]}
                    onPress={() => onToggleSchool(school.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}>
                    <View
                      style={[
                        styles.checkbox,
                        selected ? styles.checkboxSelected : null,
                      ]}>
                      {selected ? (
                        <Check size={14} color="#fff" strokeWidth={3} />
                      ) : null}
                    </View>
                    <View style={styles.schoolMeta}>
                      <Text style={styles.schoolName}>{school.name}</Text>
                      {city ? (
                        <Text style={styles.schoolCity}>{city}</Text>
                      ) : null}
                    </View>
                  </Pressable>

                  {selected ? (
                    <View style={styles.gradeSection}>
                      <Text style={styles.gradeSectionLabel}>Grades</Text>
                      <View style={styles.gradeModeRow}>
                        <Pressable
                          style={[
                            styles.gradeModeChip,
                            gradeMode === 'all' ? styles.gradeModeChipActive : null,
                          ]}
                          onPress={() => onSchoolGradeModeChange(school.id, 'all')}
                          accessibilityRole="button"
                          accessibilityState={{ selected: gradeMode === 'all' }}>
                          <Text
                            style={[
                              styles.gradeModeChipText,
                              gradeMode === 'all'
                                ? styles.gradeModeChipTextActive
                                : null,
                            ]}>
                            All grades
                          </Text>
                        </Pressable>
                        <Pressable
                          style={[
                            styles.gradeModeChip,
                            gradeMode === 'grades' ? styles.gradeModeChipActive : null,
                          ]}
                          onPress={() =>
                            onSchoolGradeModeChange(school.id, 'grades')
                          }
                          accessibilityRole="button"
                          accessibilityState={{ selected: gradeMode === 'grades' }}>
                          <Text
                            style={[
                              styles.gradeModeChipText,
                              gradeMode === 'grades'
                                ? styles.gradeModeChipTextActive
                                : null,
                            ]}>
                            Selected grades
                          </Text>
                        </Pressable>
                      </View>

                      {gradeMode === 'grades' ? (
                        <View style={styles.gradeGrid}>
                          {resolveGradeOptionsForSchool(school).map(option => {
                            const gradeSelected = selectedGrades.includes(
                              option.value,
                            );

                            return (
                              <Pressable
                                key={option.value}
                                style={[
                                  styles.gradeChip,
                                  gradeSelected ? styles.gradeChipSelected : null,
                                ]}
                                onPress={() =>
                                  onToggleSchoolGrade(school.id, option.value)
                                }
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: gradeSelected }}>
                                <Text
                                  style={[
                                    styles.gradeChipText,
                                    gradeSelected
                                      ? styles.gradeChipTextSelected
                                      : null,
                                  ]}>
                                  {option.label}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  modeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  modeChipError: {
    borderColor: colors.danger,
  },
  modeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeChipTextActive: {
    color: colors.primary,
  },
  schoolList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  schoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  schoolRowSelected: {
    backgroundColor: colors.primaryLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  schoolMeta: {
    flex: 1,
  },
  schoolName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  schoolCity: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gradeSection: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  gradeSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  gradeModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  gradeModeChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  gradeModeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  gradeModeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  gradeModeChipTextActive: {
    color: colors.primary,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gradeChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  gradeChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  gradeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  gradeChipTextSelected: {
    color: colors.primary,
  },
  loader: {
    marginVertical: 16,
  },
  emptyText: {
    padding: 14,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  errorText: {
    padding: 14,
    fontSize: 14,
    color: '#c62828',
  },
});

export default AdminSchoolAudiencePicker;

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
import { colors } from '../../constants/theme';
import type { School } from '../../store/content/types/schools.types';
import type { SchoolAudience } from '../../store/content/types/schoolAudience.types';

type AdminSchoolAudiencePickerProps = {
  audience: SchoolAudience;
  selectedSchoolIds: string[];
  schools: School[];
  schoolsLoading?: boolean;
  schoolsError?: string | null;
  onAudienceChange: (audience: SchoolAudience) => void;
  onToggleSchool: (schoolId: string) => void;
};

function AdminSchoolAudiencePicker({
  audience,
  selectedSchoolIds,
  schools,
  schoolsLoading = false,
  schoolsError = null,
  onAudienceChange,
  onToggleSchool,
}: AdminSchoolAudiencePickerProps) {
  return (
    <View style={styles.wrap}>
      <Text style={adminStyles.fieldLabel}>Audience</Text>
      <Text style={adminStyles.sectionHint}>
        Send to all schools, or limit to specific partner schools.
      </Text>

      <View style={styles.modeRow}>
        <Pressable
          style={[
            styles.modeChip,
            audience === 'all' ? styles.modeChipActive : null,
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

              return (
                <Pressable
                  key={school.id}
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

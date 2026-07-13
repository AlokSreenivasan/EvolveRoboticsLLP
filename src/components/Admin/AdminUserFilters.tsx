import { ChevronDown, GraduationCap, School, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { GRADE_OPTIONS } from '../../constants/gradeOptions';
import { colors } from '../../constants/theme';
import type { School as SchoolOption } from '../../store/content/types/schools.types';

type AdminUserFiltersProps = {
  schools: SchoolOption[];
  schoolsLoading?: boolean;
  selectedSchoolId: string | null;
  onSelectSchool: (schoolId: string | null) => void;
  selectedGrade: string | null;
  onSelectGrade: (grade: string | null) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
};

type FilterModal = 'school' | 'grade' | null;

function AdminUserFilters({
  schools,
  schoolsLoading = false,
  selectedSchoolId,
  onSelectSchool,
  selectedGrade,
  onSelectGrade,
  onClearFilters,
  hasActiveFilters,
}: AdminUserFiltersProps) {
  const [openModal, setOpenModal] = useState<FilterModal>(null);

  const selectedSchool = useMemo(
    () => schools.find(school => school.id === selectedSchoolId) ?? null,
    [schools, selectedSchoolId],
  );

  const schoolLabel = useMemo(() => {
    if (!selectedSchoolId) {
      return 'All schools';
    }
    if (selectedSchool) {
      return selectedSchool.name;
    }
    return 'School no longer listed';
  }, [selectedSchool, selectedSchoolId]);

  const gradeLabel = useMemo(() => {
    if (!selectedGrade) {
      return 'All grades';
    }
    const match = GRADE_OPTIONS.find(option => option.value === selectedGrade);
    return match?.label ?? 'Grade no longer listed';
  }, [selectedGrade]);

  const closeModal = () => setOpenModal(null);

  return (
    <View style={styles.wrap}>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setOpenModal('school')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`School filter, ${schoolLabel}. Tap to change.`}>
          <School size={16} color={colors.primary} strokeWidth={2} />
          <Text style={styles.filterButtonText} numberOfLines={1}>
            {schoolsLoading ? 'Loading schools...' : schoolLabel}
          </Text>
          {schoolsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <ChevronDown size={16} color={colors.textMuted} strokeWidth={2} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setOpenModal('grade')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Grade filter, ${gradeLabel}. Tap to change.`}>
          <GraduationCap size={16} color={colors.primary} strokeWidth={2} />
          <Text style={styles.filterButtonText} numberOfLines={1}>
            {gradeLabel}
          </Text>
          <ChevronDown size={16} color={colors.textMuted} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {hasActiveFilters ? (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClearFilters}
          accessibilityRole="button"
          accessibilityLabel="Clear school and grade filters">
          <X size={14} color={colors.primary} strokeWidth={2} />
          <Text style={styles.clearButtonText}>Clear filters</Text>
        </TouchableOpacity>
      ) : null}

      <Modal
        visible={openModal === 'school'}
        animationType="slide"
        transparent
        onRequestClose={closeModal}>
        <Pressable style={styles.backdrop} onPress={closeModal}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter by school</Text>
              <TouchableOpacity onPress={closeModal} hitSlop={8}>
                <Text style={styles.sheetDone}>Done</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={schools}
              keyExtractor={item => item.id}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    !selectedSchoolId ? styles.optionRowSelected : null,
                  ]}
                  onPress={() => {
                    onSelectSchool(null);
                    closeModal();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: !selectedSchoolId }}>
                  <Text style={styles.optionTitle}>All schools</Text>
                </TouchableOpacity>
              }
              renderItem={({ item }) => {
                const selected = item.id === selectedSchoolId;
                const city = item.city.trim();

                return (
                  <TouchableOpacity
                    style={[
                      styles.optionRow,
                      selected ? styles.optionRowSelected : null,
                    ]}
                    onPress={() => {
                      onSelectSchool(item.id);
                      closeModal();
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}>
                    <Text style={styles.optionTitle}>{item.name}</Text>
                    {city ? (
                      <Text style={styles.optionSubtitle}>{city}</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={openModal === 'grade'}
        animationType="slide"
        transparent
        onRequestClose={closeModal}>
        <Pressable style={styles.backdrop} onPress={closeModal}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter by grade</Text>
              <TouchableOpacity onPress={closeModal} hitSlop={8}>
                <Text style={styles.sheetDone}>Done</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={GRADE_OPTIONS}
              keyExtractor={item => item.value}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    !selectedGrade ? styles.optionRowSelected : null,
                  ]}
                  onPress={() => {
                    onSelectGrade(null);
                    closeModal();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: !selectedGrade }}>
                  <Text style={styles.optionTitle}>All grades</Text>
                </TouchableOpacity>
              }
              renderItem={({ item }) => {
                const selected = item.value === selectedGrade;

                return (
                  <TouchableOpacity
                    style={[
                      styles.optionRow,
                      selected ? styles.optionRowSelected : null,
                    ]}
                    onPress={() => {
                      onSelectGrade(item.value);
                      closeModal();
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}>
                    <Text style={styles.optionTitle}>{item.label}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  filterButtonText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 2,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sheetDone: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  optionRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionRowSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default AdminUserFilters;

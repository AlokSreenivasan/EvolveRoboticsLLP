import { ChevronDown, School } from 'lucide-react-native';
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

import {
  colors,
  inputFieldStyle,
  spacing,
  typography,
} from '../../constants/theme';
import type { School as SchoolOption } from '../../store/content/types/schools.types';

type SchoolPickerProps = {
  schools: SchoolOption[];
  selectedSchoolId: string | null;
  onSelectSchool: (schoolId: string) => void;
  loading?: boolean;
  error?: string | null;
  disabled?: boolean;
  hasError?: boolean;
};

function SchoolPicker({
  schools,
  selectedSchoolId,
  onSelectSchool,
  loading = false,
  error = null,
  disabled = false,
  hasError = false,
}: SchoolPickerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const selectedSchool = useMemo(
    () => schools.find(school => school.id === selectedSchoolId) ?? null,
    [schools, selectedSchoolId],
  );

  const displayLabel = useMemo(() => {
    if (selectedSchool) {
      const city = selectedSchool.city.trim();
      return city ? `${selectedSchool.name} · ${city}` : selectedSchool.name;
    }
    if (selectedSchoolId) {
      return 'School no longer listed';
    }
    return 'Select your school';
  }, [selectedSchool, selectedSchoolId]);

  const closeModal = () => setModalOpen(false);

  const handleSelect = (schoolId: string) => {
    onSelectSchool(schoolId);
    closeModal();
  };

  const openModal = () => {
    if (!disabled && !loading) {
      setModalOpen(true);
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.field,
          hasError ? styles.fieldError : null,
          disabled ? styles.fieldDisabled : null,
        ]}
        onPress={openModal}
        activeOpacity={0.7}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={
          disabled
            ? `School, ${displayLabel}. Cannot be changed.`
            : `School, ${displayLabel}. Tap to change.`
        }>
        <School size={18} color={colors.primary} strokeWidth={2} />
        <Text
          style={[
            styles.fieldText,
            !selectedSchool && !selectedSchoolId
              ? styles.placeholderText
              : null,
          ]}
          numberOfLines={2}>
          {loading ? 'Loading schools...' : displayLabel}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : disabled ? null : (
          <ChevronDown size={18} color={colors.textMuted} strokeWidth={2} />
        )}
      </TouchableOpacity>

      {error ? <Text style={styles.helperError}>{error}</Text> : null}

      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={closeModal}>
        <Pressable style={styles.backdrop} onPress={closeModal}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select your school</Text>
              <TouchableOpacity onPress={closeModal} hitSlop={8}>
                <Text style={styles.sheetDone}>Done</Text>
              </TouchableOpacity>
            </View>

            {schools.length === 0 ? (
              <Text style={styles.emptyText}>
                No schools are available yet. Please try again later.
              </Text>
            ) : (
              <FlatList
                data={schools}
                keyExtractor={item => item.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const selected = item.id === selectedSchoolId;
                  const city = item.city.trim();

                  return (
                    <TouchableOpacity
                      style={[
                        styles.optionRow,
                        selected ? styles.optionRowSelected : null,
                      ]}
                      onPress={() => handleSelect(item.id)}
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
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...inputFieldStyle,
    minHeight: 48,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  fieldDisabled: {
    opacity: 0.6,
  },
  fieldText: {
    flex: 1,
    ...typography.body,
  },
  placeholderText: {
    color: colors.textMuted,
  },
  helperError: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 4,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlayScrim,
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.cardRadiusLg,
    borderTopRightRadius: spacing.cardRadiusLg,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryMuted,
  },
  sheetTitle: {
    ...typography.cardTitle,
    color: colors.primary,
  },
  sheetDone: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
    minHeight: 44,
    lineHeight: 44,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    padding: 20,
    textAlign: 'center',
  },
  optionRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionRowSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  optionSubtitle: {
    ...typography.bodySecondary,
    marginTop: 2,
  },
});

export default SchoolPicker;

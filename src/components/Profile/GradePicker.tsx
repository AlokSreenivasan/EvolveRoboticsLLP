import { ChevronDown, GraduationCap } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { GRADE_OPTIONS } from '../../constants/gradeOptions';
import {
  colors,
  inputFieldStyle,
  spacing,
  typography,
} from '../../constants/theme';

type GradePickerProps = {
  selectedGrade: string | null;
  onSelectGrade: (grade: string) => void;
  disabled?: boolean;
  hasError?: boolean;
};

function GradePicker({
  selectedGrade,
  onSelectGrade,
  disabled = false,
  hasError = false,
}: GradePickerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const displayLabel = useMemo(() => {
    if (!selectedGrade) {
      return 'Select your grade';
    }

    const match = GRADE_OPTIONS.find(option => option.value === selectedGrade);
    return match?.label ?? 'Grade no longer listed';
  }, [selectedGrade]);

  const closeModal = () => setModalOpen(false);

  const handleSelect = (grade: string) => {
    onSelectGrade(grade);
    closeModal();
  };

  const openModal = () => {
    if (!disabled) {
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
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={
          disabled
            ? `Grade, ${displayLabel}. Cannot be changed.`
            : `Grade, ${displayLabel}. Tap to change.`
        }>
        <GraduationCap size={18} color={colors.primary} strokeWidth={2} />
        <Text
          style={[
            styles.fieldText,
            !selectedGrade ? styles.placeholderText : null,
          ]}
          numberOfLines={1}>
          {displayLabel}
        </Text>
        {disabled ? null : (
          <ChevronDown size={18} color={colors.textMuted} strokeWidth={2} />
        )}
      </TouchableOpacity>

      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={closeModal}>
        <Pressable style={styles.backdrop} onPress={closeModal}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select your grade</Text>
              <TouchableOpacity onPress={closeModal} hitSlop={8}>
                <Text style={styles.sheetDone}>Done</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={GRADE_OPTIONS}
              keyExtractor={item => item.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = item.value === selectedGrade;

                return (
                  <TouchableOpacity
                    style={[
                      styles.optionRow,
                      selected ? styles.optionRowSelected : null,
                    ]}
                    onPress={() => handleSelect(item.value)}
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
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...inputFieldStyle,
    marginBottom: 4,
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
});

export default GradePicker;

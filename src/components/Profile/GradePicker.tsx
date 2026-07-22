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
        <GraduationCap size={18} color="#a42a8b" strokeWidth={2} />
        <Text
          style={[
            styles.fieldText,
            !selectedGrade ? styles.placeholderText : null,
          ]}
          numberOfLines={1}>
          {displayLabel}
        </Text>
        {disabled ? null : (
          <ChevronDown size={18} color="#888" strokeWidth={2} />
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
    borderWidth: 1,
    borderColor: '#eecdf4',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  fieldError: {
    borderColor: '#e57373',
  },
  fieldDisabled: {
    opacity: 0.6,
  },
  fieldText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    color: '#999',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: '#fff',
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
    borderBottomColor: '#eecdf4',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#a42a8b',
  },
  sheetDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a42a8b',
  },
  optionRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  optionRowSelected: {
    backgroundColor: '#FAF2FF',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default GradePicker;

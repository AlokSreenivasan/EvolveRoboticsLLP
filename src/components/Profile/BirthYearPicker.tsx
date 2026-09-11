import { Calendar } from 'lucide-react-native';
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

import { birthYearOptions } from '../../domain/Profile/validation/ageGate';
import {
  colors,
  inputFieldStyle,
  spacing,
  typography,
} from '../../constants/theme';

type BirthYearPickerProps = {
  selectedYear: number | null;
  onSelectYear: (year: number) => void;
  disabled?: boolean;
  hasError?: boolean;
};

function BirthYearPicker({
  selectedYear,
  onSelectYear,
  disabled = false,
  hasError = false,
}: BirthYearPickerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const years = useMemo(() => birthYearOptions(), []);

  const displayLabel = selectedYear
    ? String(selectedYear)
    : 'Select your birth year';

  const closeModal = () => setModalOpen(false);

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.field,
          hasError ? styles.fieldError : null,
          disabled ? styles.fieldDisabled : null,
        ]}
        onPress={() => {
          if (!disabled) {
            setModalOpen(true);
          }
        }}
        activeOpacity={0.7}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={
          disabled
            ? `Birth year, ${displayLabel}. Cannot be changed.`
            : `Birth year, ${displayLabel}. Tap to change.`
        }>
        <Calendar size={18} color={colors.primary} strokeWidth={2} />
        <Text
          style={[
            styles.fieldText,
            !selectedYear ? styles.placeholderText : null,
          ]}
          numberOfLines={1}>
          {displayLabel}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={closeModal}>
        <Pressable style={styles.backdrop} onPress={closeModal}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select your birth year</Text>
              <TouchableOpacity onPress={closeModal} hitSlop={8}>
                <Text style={styles.sheetDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={years}
              keyExtractor={item => String(item)}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={16}
              renderItem={({ item }) => {
                const selected = item === selectedYear;
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionRow,
                      selected ? styles.optionRowSelected : null,
                    ]}
                    onPress={() => {
                      onSelectYear(item);
                      closeModal();
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}>
                    <Text style={styles.optionTitle}>{item}</Text>
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

export default BirthYearPicker;

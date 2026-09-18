import { Calendar, ChevronDown } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { birthYearOptions } from '../../domain/Profile/validation/ageGate';
import {
  daysInMonth,
  formatDateOfBirthParts,
  parseDateOfBirth,
} from '../../domain/Profile/validation/dateOfBirth';
import {
  colors,
  inputFieldStyle,
  spacing,
  typography,
} from '../../constants/theme';

const MONTH_OPTIONS = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
] as const;

type DateOfBirthPickerProps = {
  value: string | null;
  onSelect: (dateOfBirth: string) => void;
  disabled?: boolean;
  hasError?: boolean;
};

type DraftDate = {
  day: number;
  month: number;
  year: number;
};

function DateOfBirthPicker({
  value,
  onSelect,
  disabled = false,
  hasError = false,
}: DateOfBirthPickerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const years = useMemo(() => birthYearOptions(), []);

  const initialDraft = useMemo<DraftDate>(() => {
    const parsedValue = parseDateOfBirth(value);
    return {
      day: parsedValue?.getDate() ?? 1,
      month: parsedValue ? parsedValue.getMonth() + 1 : 1,
      year: parsedValue?.getFullYear() ?? years[0] ?? new Date().getFullYear(),
    };
  }, [value, years]);
  const [draft, setDraft] = useState<DraftDate>(initialDraft);

  const displayLabel = value || 'Select date of birth (DD/MM/YYYY)';
  const dayCount = daysInMonth(draft.year, draft.month);
  const days = useMemo(
    () => Array.from({ length: dayCount }, (_, index) => index + 1),
    [dayCount],
  );

  const closeModal = () => setModalOpen(false);

  const openModal = () => {
    if (disabled) {
      return;
    }
    setDraft({
      day: Math.min(
        initialDraft.day,
        daysInMonth(initialDraft.year, initialDraft.month),
      ),
      month: initialDraft.month,
      year: years.includes(initialDraft.year) ? initialDraft.year : years[0],
    });
    setModalOpen(true);
  };

  const updateDraft = (next: Partial<DraftDate>) => {
    setDraft(prev => {
      const month = next.month ?? prev.month;
      const year = next.year ?? prev.year;
      const maxDay = daysInMonth(year, month);
      const day = Math.min(next.day ?? prev.day, maxDay);
      return { day, month, year };
    });
  };

  const confirmDraft = () => {
    const formatted = formatDateOfBirthParts(draft.day, draft.month, draft.year);
    if (formatted) {
      onSelect(formatted);
    }
    closeModal();
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
            ? `Date of birth, ${displayLabel}. Cannot be changed.`
            : `Date of birth, ${displayLabel}. Tap to change.`
        }>
        <Calendar size={18} color={colors.primary} strokeWidth={2} />
        <Text
          style={[
            styles.fieldText,
            !value ? styles.placeholderText : null,
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
              <Text style={styles.sheetTitle}>Select date of birth</Text>
              <TouchableOpacity onPress={confirmDraft} hitSlop={8}>
                <Text style={styles.sheetDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetHint}>
              Scroll each column. Saved as DD / MM / YYYY.
            </Text>
            <View style={styles.columns}>
              <PickerColumn
                title="Day"
                data={days}
                selected={draft.day}
                labelForItem={item => String(item).padStart(2, '0')}
                onSelect={day => updateDraft({ day })}
              />
              <PickerColumn
                title="Month"
                data={MONTH_OPTIONS.map(option => option.value)}
                selected={draft.month}
                labelForItem={item =>
                  MONTH_OPTIONS.find(option => option.value === item)?.label ??
                  String(item)
                }
                onSelect={month => updateDraft({ month })}
              />
              <PickerColumn
                title="Year"
                data={years}
                selected={draft.year}
                labelForItem={item => String(item)}
                onSelect={year => updateDraft({ year })}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

type PickerColumnProps = {
  title: string;
  data: number[];
  selected: number;
  labelForItem: (item: number) => string;
  onSelect: (item: number) => void;
};

function PickerColumn({
  title,
  data,
  selected,
  labelForItem,
  onSelect,
}: PickerColumnProps) {
  return (
    <View style={styles.column}>
      <Text style={styles.columnTitle}>{title}</Text>
      <ScrollView
        style={styles.columnScroll}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator>
        {data.map(item => {
          const isSelected = item === selected;
          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.optionRow,
                isSelected ? styles.optionRowSelected : null,
              ]}
              onPress={() => onSelect(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}>
              <Text
                style={[
                  styles.optionTitle,
                  isSelected ? styles.optionTitleSelected : null,
                ]}
                numberOfLines={1}>
                {labelForItem(item)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  sheetHint: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  columns: {
    flexDirection: 'row',
    height: 320,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  column: {
    flex: 1,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
  },
  columnScroll: {
    flex: 1,
  },
  columnTitle: {
    ...typography.label,
    color: colors.primary,
    textAlign: 'center',
    paddingVertical: 10,
    backgroundColor: colors.primaryLight,
  },
  optionRow: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRowSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionTitle: {
    ...typography.body,
    fontWeight: '600',
    fontSize: 14,
  },
  optionTitleSelected: {
    color: colors.primary,
  },
});

export default DateOfBirthPicker;

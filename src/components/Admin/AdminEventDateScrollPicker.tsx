import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Calendar, ChevronDown } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import EventDateBlock from '../Home/EventDateBlock';
import { colors } from '../../constants/theme';
import { adminStyles } from './adminStyles';
import {
  EVENT_YEAR_MAX,
  clampEventPickerDate,
  computeDaysLeftLabel,
  formatEventDateParts,
  formatFullEventDate,
  getEventDatePickerBounds,
  hasStoredEventYear,
  resolveUpcomingEventDate,
} from '../../utils/upcomingEventDate';

type AdminEventDateScrollPickerProps = {
  month: string;
  day: string;
  year: number | null;
  onChange: (month: string, day: string, year: number) => void;
};

function AdminEventDateScrollPicker({
  month,
  day,
  year,
  onChange,
}: AdminEventDateScrollPickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerBounds = useMemo(() => getEventDatePickerBounds(), []);

  const selectedDate = useMemo(() => {
    const resolved = resolveUpcomingEventDate(month, day, {
      year: year ?? undefined,
    });
    if (resolved) {
      return clampEventPickerDate(resolved);
    }
    return pickerBounds.minimumDate;
  }, [month, day, year, pickerBounds.minimumDate]);

  const readableDate = formatFullEventDate(
    month,
    day,
    year ?? undefined,
  );
  const badgeLabel = computeDaysLeftLabel(month, day, {
    year: year ?? undefined,
  });
  const displayMonth =
    month.trim() ||
    selectedDate.toLocaleString('en', { month: 'short' }).slice(0, 3).toUpperCase();
  const displayDay = day.trim() || String(selectedDate.getDate());

  const applyDate = useCallback(
    (date: Date) => {
      const clamped = clampEventPickerDate(date);
      const parts = formatEventDateParts(clamped);
      onChange(parts.month, parts.day, parts.year);
    },
    [onChange],
  );

  const handlePickerChange = (
    event: DateTimePickerEvent,
    date?: Date,
  ) => {
    if (Platform.OS === 'android') {
      setPickerOpen(false);
      if (event.type === 'dismissed' || !date) {
        return;
      }
      applyDate(date);
      return;
    }

    if (date) {
      applyDate(date);
    }
  };

  const togglePicker = () => setPickerOpen(prev => !prev);
  const closePicker = () => setPickerOpen(false);

  return (
    <View style={adminStyles.field}>
      <Text style={adminStyles.fieldLabel}>Event date</Text>
      <Text style={styles.fieldHint}>
        Choose a date through {EVENT_YEAR_MAX}. Year is saved with the event.
      </Text>

      <TouchableOpacity
        style={styles.dateField}
        onPress={togglePicker}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Event date, ${readableDate || 'not set'}. Tap to change.`}>
        <Calendar size={18} color={colors.primary} strokeWidth={2} />
        <Text style={styles.dateFieldText} numberOfLines={1}>
          {readableDate || 'Select a date'}
        </Text>
        <ChevronDown size={18} color={colors.textMuted} strokeWidth={2} />
      </TouchableOpacity>

      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>Home card preview</Text>
        <View style={styles.previewRow}>
          <EventDateBlock month={displayMonth} day={displayDay} />
          <View style={styles.previewMeta}>
            {hasStoredEventYear(year) ? (
              <Text style={styles.previewYear}>Year {year}</Text>
            ) : null}
            {badgeLabel ? (
              <View style={adminStyles.datePickerBadge}>
                <Text style={adminStyles.datePickerBadgeText}>
                  {badgeLabel}
                </Text>
              </View>
            ) : (
              <Text style={styles.previewHint}>
                Days-left badge shows for today or future dates.
              </Text>
            )}
          </View>
        </View>
      </View>

      {Platform.OS === 'android' && pickerOpen ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="calendar"
          minimumDate={pickerBounds.minimumDate}
          maximumDate={pickerBounds.maximumDate}
          onChange={handlePickerChange}
        />
      ) : null}

      {Platform.OS === 'ios' && pickerOpen ? (
        <View style={styles.iosPickerSheet}>
          <View style={styles.iosPickerHeader}>
            <TouchableOpacity onPress={closePicker} hitSlop={8}>
              <Text style={styles.iosPickerDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            minimumDate={pickerBounds.minimumDate}
            maximumDate={pickerBounds.maximumDate}
            onChange={handlePickerChange}
            style={styles.iosPicker}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
    lineHeight: 17,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  dateFieldText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  previewCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  previewMeta: {
    flex: 1,
  },
  previewYear: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  previewHint: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  iosPickerSheet: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  iosPickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  iosPicker: {
    height: 216,
  },
});

export default AdminEventDateScrollPicker;

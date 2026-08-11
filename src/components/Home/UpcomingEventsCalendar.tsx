import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import {
  cardShadowLight,
  colors,
  glassBorder,
  spacing,
  typography,
} from '../../constants/theme';
import CardShadowShell from '../ui/CardShadowShell';
import {
  getDaysInMonth,
  isSameLocalDay,
  startOfLocalDay,
  toLocalDateKey,
} from '../../utils/upcomingEventDate';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MAX_EVENT_DOTS = 3;

export type CalendarDayCell = {
  date: Date;
  inCurrentMonth: boolean;
  eventCount: number;
};

type UpcomingEventsCalendarProps = {
  visibleMonth: Date;
  selectedDate: Date;
  /** Map of YYYY-MM-DD → event count for marking days. */
  eventCountsByDate: Record<string, number>;
  onSelectDate: (date: Date) => void;
  onChangeMonth: (delta: number) => void;
};

function buildMonthCells(visibleMonth: Date): CalendarDayCell[] {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const daysInMonth = getDaysInMonth(month, year);
  const firstWeekday = new Date(year, month, 1).getDay();
  const cells: CalendarDayCell[] = [];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrev = getDaysInMonth(prevMonth, prevYear);

  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    cells.push({
      date: startOfLocalDay(new Date(prevYear, prevMonth, daysInPrev - i)),
      inCurrentMonth: false,
      eventCount: 0,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: startOfLocalDay(new Date(year, month, day)),
      inCurrentMonth: true,
      eventCount: 0,
    });
  }

  const trailing = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= trailing; day += 1) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    cells.push({
      date: startOfLocalDay(new Date(nextYear, nextMonth, day)),
      inCurrentMonth: false,
      eventCount: 0,
    });
  }

  return cells;
}

function UpcomingEventsCalendar({
  visibleMonth,
  selectedDate,
  eventCountsByDate,
  onSelectDate,
  onChangeMonth,
}: UpcomingEventsCalendarProps) {
  const today = useMemo(() => startOfLocalDay(new Date()), []);

  const monthLabel = useMemo(
    () =>
      visibleMonth.toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
      }),
    [visibleMonth],
  );

  const cells = useMemo(() => {
    return buildMonthCells(visibleMonth).map(cell => ({
      ...cell,
      eventCount: eventCountsByDate[toLocalDateKey(cell.date)] ?? 0,
    }));
  }, [eventCountsByDate, visibleMonth]);

  return (
    <CardShadowShell
      elevation="light"
      borderRadius={spacing.cardRadiusLg}
      innerStyle={styles.cardInner}>
      <View style={styles.monthHeader}>
        <Pressable
          onPress={() => onChangeMonth(-1)}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          hitSlop={8}
          style={({ pressed }) => [
            styles.navChip,
            pressed && styles.navChipPressed,
          ]}>
          <ChevronLeft size={18} color={colors.primary} strokeWidth={2.5} />
        </Pressable>

        <Text style={styles.monthLabel} accessibilityRole="header">
          {monthLabel}
        </Text>

        <Pressable
          onPress={() => onChangeMonth(1)}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          hitSlop={8}
          style={({ pressed }) => [
            styles.navChip,
            pressed && styles.navChipPressed,
          ]}>
          <ChevronRight size={18} color={colors.primary} strokeWidth={2.5} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map(label => (
          <Text key={label} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map(cell => {
          const key = toLocalDateKey(cell.date);
          const selected = isSameLocalDay(cell.date, selectedDate);
          const isToday = isSameLocalDay(cell.date, today);
          const hasEvents = cell.eventCount > 0;
          const dotCount = Math.min(cell.eventCount, MAX_EVENT_DOTS);

          return (
            <Pressable
              key={key}
              onPress={() => onSelectDate(cell.date)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${cell.date.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}${hasEvents ? `, ${cell.eventCount} event${cell.eventCount === 1 ? '' : 's'}` : ''}`}
              style={styles.dayCell}>
              <View
                style={[
                  styles.dayFace,
                  !cell.inCurrentMonth && styles.dayOutside,
                  isToday && !selected && styles.dayToday,
                  selected && styles.daySelected,
                ]}>
                <Text
                  style={[
                    styles.dayNumber,
                    !cell.inCurrentMonth && styles.dayNumberOutside,
                    selected && styles.dayNumberSelected,
                  ]}>
                  {cell.date.getDate()}
                </Text>
              </View>

              <View style={styles.dotsRow}>
                {hasEvents
                  ? Array.from({ length: dotCount }).map((_, index) => (
                      <View
                        key={`${key}-dot-${index}`}
                        style={[
                          styles.eventDot,
                          selected && styles.eventDotSelected,
                          !cell.inCurrentMonth && styles.eventDotOutside,
                        ]}
                      />
                    ))
                  : (
                      <View style={styles.dotPlaceholder} />
                    )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </CardShadowShell>
  );
}

const styles = StyleSheet.create({
  cardInner: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 10,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  monthLabel: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },
  navChip: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    ...glassBorder,
    borderColor: colors.primaryMuted,
    ...cardShadowLight,
  },
  navChipPressed: {
    backgroundColor: colors.primaryMuted,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  dayFace: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOutside: {
    opacity: 0.45,
  },
  dayToday: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dayNumberOutside: {
    color: colors.textMuted,
  },
  dayNumberSelected: {
    color: '#fff',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 6,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  eventDotSelected: {
    backgroundColor: colors.primarySoft,
  },
  eventDotOutside: {
    backgroundColor: colors.primaryMuted,
  },
  dotPlaceholder: {
    width: 5,
    height: 5,
  },
});

export default React.memo(UpcomingEventsCalendar);

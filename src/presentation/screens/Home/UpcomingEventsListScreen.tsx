import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Calendar } from 'lucide-react-native';

import UpcomingEventBanner from '../../../components/Home/UpcomingEventBanner';
import UpcomingEventsCalendar from '../../../components/Home/UpcomingEventsCalendar';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import ScreenStateCard from '../../../components/ui/ScreenStateCard';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, spacing, typography } from '../../../constants/theme';
import type { UpcomingEvent } from '../../../store/content/types/upcomingEvents.types';
import {
  addMonths,
  resolveUpcomingEventDate,
  startOfLocalDay,
  startOfMonth,
  toLocalDateKey,
} from '../../../utils/upcomingEventDate';
import {
  useHomeFeedFocus,
  useHomeFeedRefresh,
} from '../../context/HomeFeedContext';
import { useUpcomingEvents } from '../../hooks/useUpcomingEvents';

function UpcomingEventsListScreen() {
  useHomeFeedFocus();
  const { displayEvents, loading, error } = useUpcomingEvents();
  const { refresh, refreshing } = useHomeFeedRefresh();

  const today = useMemo(() => startOfLocalDay(new Date()), []);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(() => today);
  const [didAutoSelect, setDidAutoSelect] = useState(false);

  const eventsByDate = useMemo(() => {
    const map: Record<string, UpcomingEvent[]> = {};
    for (const event of displayEvents) {
      const resolved = resolveUpcomingEventDate(event.month, event.day, {
        year: event.year ?? undefined,
      });
      if (!resolved) {
        continue;
      }
      const key = toLocalDateKey(resolved);
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(event);
    }
    return map;
  }, [displayEvents]);

  const eventCountsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [key, events] of Object.entries(eventsByDate)) {
      counts[key] = events.length;
    }
    return counts;
  }, [eventsByDate]);

  useEffect(() => {
    if (didAutoSelect || loading || error || displayEvents.length === 0) {
      return;
    }

    const todayKey = toLocalDateKey(today);
    if (eventsByDate[todayKey]?.length) {
      setSelectedDate(today);
      setVisibleMonth(startOfMonth(today));
      setDidAutoSelect(true);
      return;
    }

    let earliest: Date | null = null;
    for (const event of displayEvents) {
      const resolved = resolveUpcomingEventDate(event.month, event.day, {
        year: event.year ?? undefined,
      });
      if (!resolved) {
        continue;
      }
      if (!earliest || resolved < earliest) {
        earliest = resolved;
      }
    }

    if (earliest) {
      setSelectedDate(earliest);
      setVisibleMonth(startOfMonth(earliest));
    }
    setDidAutoSelect(true);
  }, [didAutoSelect, displayEvents, error, eventsByDate, loading, today]);

  const selectedKey = toLocalDateKey(selectedDate);
  const selectedEvents = eventsByDate[selectedKey] ?? [];

  const selectedDayLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [selectedDate],
  );

  const handleSelectDate = useCallback((date: Date) => {
    const day = startOfLocalDay(date);
    setSelectedDate(day);
    setVisibleMonth(startOfMonth(day));
  }, []);

  const handleChangeMonth = useCallback((delta: number) => {
    setVisibleMonth(current => addMonths(current, delta));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: UpcomingEvent }) => (
      <UpcomingEventBanner event={item} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: UpcomingEvent) => item.id, []);

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ScreenStateCard variant="loading" />;
    }
    if (error) {
      return (
        <ScreenStateCard
          variant="error"
          title="Could not load events"
          message="Pull down to refresh, or try again in a moment."
          Icon={Calendar}
        />
      );
    }
    if (displayEvents.length === 0) {
      return (
        <ScreenStateCard
          variant="empty"
          title="No upcoming events"
          message="When admins add events, they’ll show up here."
          Icon={Calendar}
        />
      );
    }
    return (
      <ScreenStateCard
        variant="empty"
        title="No events on this day"
        message="Pick another day with a marker to see what’s coming up."
        Icon={Calendar}
      />
    );
  }, [displayEvents.length, error, loading]);

  const countLabel =
    !loading && !error && displayEvents.length > 0
      ? `${displayEvents.length} event${displayEvents.length === 1 ? '' : 's'}`
      : null;

  const dayCountLabel =
    !loading && !error && selectedEvents.length > 0
      ? `${selectedEvents.length} on this day`
      : null;

  const listHeader = (
    <View style={styles.headerBlock}>
      {!error ? (
        <UpcomingEventsCalendar
          visibleMonth={visibleMonth}
          selectedDate={selectedDate}
          eventCountsByDate={eventCountsByDate}
          onSelectDate={handleSelectDate}
          onChangeMonth={handleChangeMonth}
        />
      ) : null}

      {countLabel ? (
        <Text style={styles.countBadge}>{countLabel}</Text>
      ) : null}

      {!loading && !error && displayEvents.length > 0 ? (
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>{selectedDayLabel}</Text>
          {dayCountLabel ? (
            <Text style={styles.dayCount}>{dayCountLabel}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Events Calendar" />

      <FlatList
        data={loading || error ? [] : selectedEvents}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ItemSeparatorComponent={ListSeparator}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        {...VERTICAL_LIST_PERF}
      />
    </SafeAreaView>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBlock: {
    gap: 16,
    marginBottom: 4,
  },
  countBadge: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  dayHeader: {
    gap: 4,
  },
  dayTitle: {
    ...typography.sectionTitle,
  },
  dayCount: {
    ...typography.bodySecondary,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  separator: {
    height: 14,
  },
});

export default UpcomingEventsListScreen;

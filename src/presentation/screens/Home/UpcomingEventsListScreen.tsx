import React, { useCallback } from 'react';
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
import ScreenHeader from '../../../components/ui/ScreenHeader';
import ScreenStateCard from '../../../components/ui/ScreenStateCard';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, spacing } from '../../../constants/theme';
import type { UpcomingEvent } from '../../../store/content/types/upcomingEvents.types';
import {
  useHomeFeedFocus,
  useHomeFeedRefresh,
} from '../../context/HomeFeedContext';
import { useUpcomingEvents } from '../../hooks/useUpcomingEvents';

function UpcomingEventsListScreen() {
  useHomeFeedFocus();
  const { section, displayEvents, loading, error } = useUpcomingEvents();
  const { refresh, refreshing } = useHomeFeedRefresh();

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
    return (
      <ScreenStateCard
        variant="empty"
        title="No upcoming events"
        message="When admins add events, they’ll show up here."
        Icon={Calendar}
      />
    );
  }, [error, loading]);

  const countLabel =
    !loading && !error && displayEvents.length > 0
      ? `${displayEvents.length} event${displayEvents.length === 1 ? '' : 's'}`
      : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={section.sectionTitle} />

      <FlatList
        data={loading || error ? [] : displayEvents}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={
          !loading && !error && countLabel ? (
            <Text style={styles.countBadge}>{countLabel}</Text>
          ) : null
        }
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
  countBadge: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
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

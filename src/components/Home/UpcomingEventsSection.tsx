import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { NESTED_LIST_PERF } from '../../constants/listPerformance';
import { useUpcomingEvents } from '../../presentation/hooks/useUpcomingEvents';
import type { UpcomingEvent } from '../../store/content/types/upcomingEvents.types';
import HomeFeedSection from './HomeFeedSection';
import UpcomingEventBanner from './UpcomingEventBanner';

function UpcomingEventsSection() {
  const { section, displayEvents, loading, error } = useUpcomingEvents();
  const isEmpty = !loading && !error && displayEvents.length === 0;

  const renderEvent = useCallback(
    ({ item }: { item: UpcomingEvent }) => <UpcomingEventBanner event={item} />,
    [],
  );

  const keyExtractor = useCallback((item: UpcomingEvent) => item.id, []);

  return (
    <HomeFeedSection
        title={section.sectionTitle}
        actionLabel={section.actionLabel || undefined}
        subtitle={section.sectionSubtitle?.trim() || undefined}
        loading={loading}
        errorMessage={
          error
            ? 'Could not load events. Pull down to try again.'
            : null
        }
        emptyTitle={isEmpty ? 'No upcoming events' : undefined}
        emptyMessage={
          isEmpty
            ? 'When admins add events, they’ll show up here instantly.'
            : undefined
        }>
        {!loading && !error && displayEvents.length > 0 ? (
          <FlatList
            data={displayEvents}
            keyExtractor={keyExtractor}
            renderItem={renderEvent}
            ItemSeparatorComponent={ListSeparator}
            contentContainerStyle={styles.listContent}
            {...NESTED_LIST_PERF}
          />
        ) : null}
    </HomeFeedSection>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 6,
  },
  separator: {
    height: 14,
  },
});

export default UpcomingEventsSection;

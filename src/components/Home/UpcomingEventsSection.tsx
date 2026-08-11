import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { NESTED_LIST_PERF } from '../../constants/listPerformance';
import { useUpcomingEvents } from '../../presentation/hooks/useUpcomingEvents';
import type { UpcomingEvent } from '../../store/content/types/upcomingEvents.types';
import type { LoginScreenNavigationProp } from '../../types/navigation';
import HomeFeedSection from './HomeFeedSection';
import UpcomingEventBanner from './UpcomingEventBanner';

const HOME_PREVIEW_LIMIT = 3;

function UpcomingEventsSection() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { section, displayEvents, loading, error } = useUpcomingEvents();
  const previewEvents = useMemo(
    () => displayEvents.slice(0, HOME_PREVIEW_LIMIT),
    [displayEvents],
  );
  const isEmpty = !loading && !error && displayEvents.length === 0;
  const hasEvents = !loading && !error && displayEvents.length > 0;

  const openList = useCallback(() => {
    navigation.navigate('UpcomingEventsList');
  }, [navigation]);

  const renderEvent = useCallback(
    ({ item }: { item: UpcomingEvent }) => (
      <UpcomingEventBanner event={item} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: UpcomingEvent) => item.id, []);

  return (
    <HomeFeedSection
        title={section.sectionTitle}
        actionLabel={hasEvents ? 'Events Calendar' : undefined}
        onActionPress={hasEvents ? openList : undefined}
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
        {hasEvents ? (
          <FlatList
            data={previewEvents}
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

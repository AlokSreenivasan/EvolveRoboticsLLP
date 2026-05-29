import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useUpcomingEvents } from '../../presentation/hooks/useUpcomingEvents';
import HomeFeedSection from './HomeFeedSection';
import UpcomingEventBanner from './UpcomingEventBanner';

function UpcomingEventsSection() {
  const { section, displayEvents, loading, error } = useUpcomingEvents();
  const isEmpty = !loading && !error && displayEvents.length === 0;

  return (
    <HomeFeedSection
        title={section.sectionTitle}
        actionLabel={section.actionLabel || undefined}
        subtitle={section.sectionSubtitle?.trim() || undefined}
        loading={loading}
        errorMessage={
          error
            ? 'Could not load events. Pull to refresh the home screen.'
            : null
        }
        emptyTitle={isEmpty ? 'No upcoming events' : undefined}
        emptyMessage={
          isEmpty
            ? 'When admins add events, they’ll show up here instantly.'
            : undefined
        }>
        {!loading && !error && displayEvents.length > 0 ? (
          <View style={styles.list}>
            {displayEvents.map(event => (
              <UpcomingEventBanner key={event.id} event={event} />
            ))}
          </View>
        ) : null}
    </HomeFeedSection>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
});

export default UpcomingEventsSection;

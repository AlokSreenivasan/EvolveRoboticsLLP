import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cardShadow, colors } from '../../constants/theme';
import type { UpcomingEvent } from '../../store/content/types/upcomingEvents.types';
import { getDisplayDaysLeftLabel } from '../../utils/upcomingEventDate';
import EventDateBlock from './EventDateBlock';

type UpcomingEventBannerProps = {
  event: UpcomingEvent;
};

function UpcomingEventBanner({ event }: UpcomingEventBannerProps) {
  const daysLeftLabel = getDisplayDaysLeftLabel(
    event.month,
    event.day,
    event.daysLeftLabel,
    event.year ?? undefined,
  );

  return (
    <View style={styles.card}>
      <EventDateBlock month={event.month} day={event.day} />

      <View style={styles.details}>
        <Text style={styles.title}>{event.title}</Text>
        {event.dateRange ? (
          <Text style={styles.meta}>{event.dateRange}</Text>
        ) : null}
        {event.timeRange ? (
          <Text style={styles.meta}>{event.timeRange}</Text>
        ) : null}
      </View>

      {daysLeftLabel ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{daysLeftLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.eventBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.eventBorder,
    ...cardShadow,
    gap: 14,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  badge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default React.memo(UpcomingEventBanner);

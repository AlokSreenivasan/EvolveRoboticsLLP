import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cardShadow, colors, glassBorder } from '../../constants/theme';
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
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 14,
    ...glassBorder,
    borderColor: colors.eventBorder,
    ...cardShadow,
    gap: 12,
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 17,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default React.memo(UpcomingEventBanner);

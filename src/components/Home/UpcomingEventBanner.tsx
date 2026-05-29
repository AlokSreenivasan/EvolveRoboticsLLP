import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cardShadow, colors } from '../../constants/theme';
import type { UpcomingEvent } from '../../store/content/types/upcomingEvents.types';

type UpcomingEventBannerProps = {
  event: UpcomingEvent;
};

function UpcomingEventBanner({ event }: UpcomingEventBannerProps) {
  return (
    <View style={styles.card}>
      <View style={styles.dateBlock}>
        <Text style={styles.month}>{event.month}</Text>
        <Text style={styles.day}>{event.day}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.title}>{event.title}</Text>
        {event.dateRange ? (
          <Text style={styles.meta}>{event.dateRange}</Text>
        ) : null}
        {event.timeRange ? (
          <Text style={styles.meta}>{event.timeRange}</Text>
        ) : null}
      </View>

      {event.daysLeftLabel ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{event.daysLeftLabel}</Text>
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
  },
  dateBlock: {
    width: 56,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  month: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  day: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
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

export default UpcomingEventBanner;

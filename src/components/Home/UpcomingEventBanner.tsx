import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';
import CardShadowShell from '../ui/CardShadowShell';
import type { UpcomingEvent } from '../../store/content/types/upcomingEvents.types';
import { getDisplayDaysLeftLabel } from '../../utils/upcomingEventDate';
import EventDateBlock from './EventDateBlock';

type UpcomingEventBannerProps = {
  event: UpcomingEvent;
  onPress?: () => void;
};

function UpcomingEventBanner({ event, onPress }: UpcomingEventBannerProps) {
  const daysLeftLabel = getDisplayDaysLeftLabel(
    event.month,
    event.day,
    event.daysLeftLabel,
    event.year ?? undefined,
  );

  const content = (
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
        {event.location ? (
          <Text style={styles.meta}>
            <Text style={styles.venueLabel}>Venue: </Text>
            {event.location}
          </Text>
        ) : null}
      </View>

      {daysLeftLabel ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{daysLeftLabel}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <CardShadowShell
      elevation="none"
      borderRadius={20}
      innerStyle={styles.cardInner}>
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={event.title}>
          {content}
        </Pressable>
      ) : (
        content
      )}
    </CardShadowShell>
  );
}

const styles = StyleSheet.create({
  cardInner: {
    borderColor: colors.eventBorder,
    backgroundColor: colors.surface,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
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
  venueLabel: {
    fontWeight: '700',
    color: colors.textPrimary,
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

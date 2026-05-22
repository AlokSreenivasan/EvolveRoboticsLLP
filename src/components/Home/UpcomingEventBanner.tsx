import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { UPCOMING_EVENT } from '../../constants/homeScreenData';
import { cardShadow, colors } from '../../constants/theme';

function UpcomingEventBanner() {
  return (
    <View style={styles.card}>
      <View style={styles.dateBlock}>
        <Text style={styles.month}>{UPCOMING_EVENT.month}</Text>
        <Text style={styles.day}>{UPCOMING_EVENT.day}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.title}>{UPCOMING_EVENT.title}</Text>
        <Text style={styles.meta}>{UPCOMING_EVENT.dateRange}</Text>
        <Text style={styles.meta}>{UPCOMING_EVENT.timeRange}</Text>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{UPCOMING_EVENT.daysLeft}</Text>
      </View>
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

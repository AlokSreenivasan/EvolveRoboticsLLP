import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useUpcomingEvents } from '../../presentation/hooks/useUpcomingEvents';
import { colors, spacing } from '../../constants/theme';
import HomeSectionHeader from './HomeSectionHeader';
import UpcomingEventBanner from './UpcomingEventBanner';

function UpcomingEventsSection() {
  const { section, displayEvents, loading, error } = useUpcomingEvents();
  const isEmpty = !loading && !error && displayEvents.length === 0;

  return (
    <View style={styles.section}>
      <HomeSectionHeader
        title={section.sectionTitle}
        actionLabel={section.actionLabel || undefined}
      />
      {section.sectionSubtitle?.trim() ? (
        <Text style={styles.sectionSubtitle}>{section.sectionSubtitle.trim()}</Text>
      ) : null}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>
            Could not load events. Pull to refresh the home screen.
          </Text>
        </View>
      ) : isEmpty ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No upcoming events</Text>
          <Text style={styles.emptyText}>
            When admins add events, they’ll show up here instantly.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {displayEvents.map(event => (
            <UpcomingEventBanner key={event.id} event={event} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.sectionGap,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: -4,
    marginBottom: 12,
    paddingHorizontal: 4,
    lineHeight: 18,
  },
  list: {
    gap: 12,
  },
  loadingWrap: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  errorWrap: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyWrap: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default UpcomingEventsSection;

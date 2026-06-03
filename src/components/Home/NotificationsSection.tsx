import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { NESTED_LIST_PERF } from '../../constants/listPerformance';
import { useNotifications } from '../../presentation/hooks/useNotifications';
import type { AppNotification } from '../../store/content/types/notifications.types';
import HomeFeedSection from './HomeFeedSection';
import NotificationItemCard from './NotificationItemCard';

function NotificationsSection() {
  const { displayNotifications, loading, error } = useNotifications();
  const isEmpty = !loading && !error && displayNotifications.length === 0;

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <NotificationItemCard notification={item} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: AppNotification) => item.id, []);

  return (
    <HomeFeedSection
      title="Notifications"
      loading={loading}
      errorMessage={
        error
          ? 'Could not load notifications. Pull down to try again.'
          : null
      }
      emptyTitle={isEmpty ? 'No notifications' : undefined}
      emptyMessage={
        isEmpty
          ? 'When admins post announcements, they’ll appear here.'
          : undefined
      }>
      {!loading && !error && displayNotifications.length > 0 ? (
        <FlatList
          data={displayNotifications}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ListSeparator}
          scrollEnabled={false}
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
  separator: {
    height: 12,
  },
});

export default NotificationsSection;

import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { NESTED_LIST_PERF } from '../../constants/listPerformance';
import { useNotifications } from '../../presentation/hooks/useNotifications';
import type { LearnerNotification } from '../../store/content/types/notifications.types';
import type { LoginScreenNavigationProp } from '../../types/navigation';
import HomeFeedSection from './HomeFeedSection';
import NotificationItemCard from './NotificationItemCard';

const HOME_PREVIEW_LIMIT = 3;

function NotificationsSection() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { displayNotifications, markNotificationRead, loading, error } =
    useNotifications();
  const previewNotifications = useMemo(
    () => displayNotifications.slice(0, HOME_PREVIEW_LIMIT),
    [displayNotifications],
  );
  const isEmpty = !loading && !error && displayNotifications.length === 0;

  const renderItem = useCallback(
    ({ item }: { item: LearnerNotification }) => (
      <NotificationItemCard
        notification={item}
        onMarkRead={markNotificationRead}
      />
    ),
    [markNotificationRead],
  );

  const keyExtractor = useCallback((item: LearnerNotification) => item.id, []);

  return (
    <HomeFeedSection
      title="Notifications"
      actionLabel={
        !loading && !error && displayNotifications.length > 0
          ? 'View all'
          : undefined
      }
      onActionPress={() => navigation.navigate('NotificationsList')}
      loading={loading}
      errorMessage={
        error
          ? 'Could not load notifications. Pull down to try again.'
          : null
      }
      emptyTitle={isEmpty ? 'No notifications' : undefined}
      emptyMessage={isEmpty ? 'No updates yet.' : undefined}>
      {!loading && !error && previewNotifications.length > 0 ? (
        <FlatList
          data={previewNotifications}
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

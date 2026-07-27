import React, { useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, Settings2 } from 'lucide-react-native';

import NotificationItemCard from '../../../components/Home/NotificationItemCard';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import ScreenStateCard from '../../../components/ui/ScreenStateCard';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import {
  colors,
  spacing,
  typography,
} from '../../../constants/theme';
import type { LearnerNotification } from '../../../store/content/types/notifications.types';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import {
  useHomeFeedFocus,
  useHomeFeedRefresh,
} from '../../context/HomeFeedContext';
import { useNotifications } from '../../hooks/useNotifications';

function NotificationsListScreen() {
  useHomeFeedFocus();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const {
    displayNotifications,
    unreadCount,
    markNotificationRead,
    loading,
    error,
  } = useNotifications();
  const { refresh, refreshing } = useHomeFeedRefresh();

  const renderItem = useCallback(
    ({ item }: { item: LearnerNotification }) => (
      <NotificationItemCard
        notification={item}
        variant="list"
        onMarkRead={markNotificationRead}
      />
    ),
    [markNotificationRead],
  );

  const keyExtractor = useCallback((item: LearnerNotification) => item.id, []);

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ScreenStateCard variant="loading" />;
    }
    if (error) {
      return (
        <ScreenStateCard
          variant="error"
          title="Could not load notifications"
          message="Pull down to refresh, or try again in a moment."
          Icon={Bell}
        />
      );
    }
    return (
      <ScreenStateCard
        variant="empty"
        title="No notifications yet"
        message="New updates from your learning team will show up here."
        Icon={Bell}
      />
    );
  }, [error, loading]);

  const countLabel =
    !loading && !error && displayNotifications.length > 0
      ? unreadCount > 0
        ? `${unreadCount} unread`
        : 'All caught up'
      : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Notifications"
        subtitle="Course news and updates from your instructors."
      />

      <FlatList
        data={loading || error ? [] : displayNotifications}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={
          !loading && !error ? (
            <>
              {countLabel ? (
                <Text style={styles.countBadge}>{countLabel}</Text>
              ) : null}
              <SurfaceCard tinted elevation="default" style={styles.infoCard}>
              <View style={styles.infoIconWrap}>
                <Bell size={22} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoTitle}>In-app updates</Text>
                <Text style={styles.infoDescription}>
                  Posted by your learning team. Adjust push alerts in notification
                  settings.
                </Text>
              </View>
            </SurfaceCard>
            </>
          ) : null
        }
        ListFooterComponent={
          !loading ? (
            <TouchableOpacity
              style={styles.settingsLink}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('NotificationPreferences')}
              accessibilityRole="button"
              accessibilityLabel="Notification settings">
              <Settings2 size={18} color={colors.primary} strokeWidth={2} />
              <Text style={styles.settingsLinkText}>
                Notification settings
              </Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={listEmpty}
        ItemSeparatorComponent={ListSeparator}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        {...VERTICAL_LIST_PERF}
      />
    </SafeAreaView>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  countBadge: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
  },
  infoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: spacing.iconTileRadius,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    ...typography.cardTitle,
    fontSize: 15,
    marginBottom: 4,
  },
  infoDescription: {
    ...typography.bodySecondary,
    lineHeight: 19,
  },
  separator: {
    height: 12,
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: spacing.buttonRadius,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryMuted,
  },
  settingsLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default NotificationsListScreen;

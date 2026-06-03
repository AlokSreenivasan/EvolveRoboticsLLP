import React, { useCallback } from 'react';
import {
  ActivityIndicator,
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

import BackButton from '../../../components/BackButton';
import NotificationItemCard from '../../../components/Home/NotificationItemCard';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { cardShadow, colors, spacing } from '../../../constants/theme';
import type { AppNotification } from '../../../store/content/types/notifications.types';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import {
  useHomeFeedFocus,
  useHomeFeedRefresh,
} from '../../context/HomeFeedContext';
import { useNotifications } from '../../hooks/useNotifications';

function NotificationsListScreen() {
  useHomeFeedFocus();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { displayNotifications, loading, error } = useNotifications();
  const { refresh, refreshing } = useHomeFeedRefresh();

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <NotificationItemCard notification={item} variant="list" />
    ),
    [],
  );

  const keyExtractor = useCallback((item: AppNotification) => item.id, []);

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    }
    if (error) {
      return (
        <View style={styles.messageCard}>
          <View style={styles.messageIconWrap}>
            <Bell size={24} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.messageTitle}>Could not load notifications</Text>
          <Text style={styles.messageText}>
            Pull down to refresh, or try again in a moment.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.messageCard}>
        <View style={styles.messageIconWrap}>
          <Bell size={24} color={colors.primary} strokeWidth={2} />
        </View>
        <Text style={styles.messageTitle}>No notifications yet</Text>
        <Text style={styles.messageText}>
          New updates from your learning team will show up here.
        </Text>
      </View>
    );
  }, [error, loading]);

  const countLabel =
    !loading && !error && displayNotifications.length > 0
      ? `${displayNotifications.length} update${
          displayNotifications.length === 1 ? '' : 's'
        }`
      : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton withSpacingBelow />
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          Course news and updates from your instructors.
        </Text>
        {countLabel ? <Text style={styles.countBadge}>{countLabel}</Text> : null}
      </View>

      <FlatList
        data={loading || error ? [] : displayNotifications}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={
          !loading && !error ? (
            <View style={styles.infoCard}>
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
            </View>
          ) : null
        }
        ListFooterComponent={
          !loading ? (
            <TouchableOpacity
              style={styles.settingsLink}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('NotificationPreferences')}>
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
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  countBadge: {
    alignSelf: 'flex-start',
    marginTop: 10,
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
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.noticeBorder,
    ...cardShadow,
  },
  infoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  separator: {
    height: 12,
  },
  loader: {
    marginVertical: 40,
  },
  messageCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: spacing.cardRadius,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default NotificationsListScreen;

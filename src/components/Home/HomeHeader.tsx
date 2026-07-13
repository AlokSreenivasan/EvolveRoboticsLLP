import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell } from 'lucide-react-native';

import { cardShadowLight, colors } from '../../constants/theme';
import { useNotifications } from '../../presentation/hooks/useNotifications';
import type { LoginScreenNavigationProp } from '../../types/navigation';

type HomeHeaderProps = {
  displayName: string;
};

function HomeHeader({ displayName }: HomeHeaderProps) {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { unreadCount, loading, error } = useNotifications();
  const firstName = displayName.trim().split(/\s+/)[0] || 'Learner';
  const notificationCount = !loading && !error ? unreadCount : 0;
  const badgeLabel =
    notificationCount > 9 ? '9+' : String(notificationCount);

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.greeting}>Hello, {firstName}</Text>
        <Text style={styles.tagline}>
          Keep learning, keep building the future!
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            notificationCount > 0
              ? `Notifications, ${notificationCount} unread`
              : 'Notifications'
          }
          accessibilityHint="View your notifications"
          onPress={() => navigation.navigate('NotificationsList')}
          style={({ pressed }) => [
            styles.notificationButton,
            pressed && styles.notificationButtonPressed,
          ]}>
          <Bell size={22} color={colors.primary} strokeWidth={2.25} />
          {notificationCount > 0 ? (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{badgeLabel}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    gap: 12,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  tagline: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadowLight,
  },
  notificationButtonPressed: {
    opacity: 0.88,
    backgroundColor: colors.primaryLight,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.surface,
    lineHeight: 12,
  },
});

export default HomeHeader;

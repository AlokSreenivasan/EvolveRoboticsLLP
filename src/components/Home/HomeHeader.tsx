import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell } from 'lucide-react-native';

import { cardShadowLight, colors, glassBorder, spacing } from '../../constants/theme';
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

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.greeting} accessibilityRole="header">
          Hello, {firstName}
        </Text>
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
          <Bell size={20} color={colors.primary} strokeWidth={2.25} />
          {notificationCount > 0 ? (
            <View style={styles.notificationDot} />
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
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: colors.background,
    gap: 14,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...glassBorder,
    ...cardShadowLight,
  },
  notificationButtonPressed: {
    opacity: 0.9,
    backgroundColor: colors.primaryLight,
    transform: [{ scale: 0.96 }],
  },
  notificationDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});

export default HomeHeader;

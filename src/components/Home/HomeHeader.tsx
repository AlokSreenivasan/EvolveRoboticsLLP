import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, Menu } from 'lucide-react-native';

import { colors } from '../../constants/theme';
import ProfileAvatar from '../Profile/ProfileAvatar';

type HomeHeaderProps = {
  displayName: string;
  profileImage?: string | null;
  notificationCount?: number;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
};

function HomeHeader({
  displayName,
  profileImage,
  notificationCount = 3,
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
}: HomeHeaderProps) {
  const firstName = displayName.trim().split(/\s+/)[0] || 'Learner';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Open menu">
        <Menu size={24} color={colors.primary} strokeWidth={2} />
      </TouchableOpacity>

      <View style={styles.greetingBlock}>
        <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
        <Text style={styles.tagline}>
          Keep learning, keep building the future!
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.bellButton}
          onPress={onNotificationsPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Notifications">
          <Bell size={22} color={colors.primary} strokeWidth={2} />
          {notificationCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8}>
          <ProfileAvatar imageUri={profileImage} size={40} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  menuButton: {
    marginRight: 12,
  },
  greetingBlock: {
    flex: 1,
    marginRight: 8,
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
    gap: 10,
  },
  bellButton: {
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default HomeHeader;

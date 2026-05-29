import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BookOpen,
  Calendar,
  Home,
  Settings,
  Shield,
} from 'lucide-react-native';

import { colors } from '../../constants/theme';

export type HomeTabKey =
  | 'home'
  | 'courses'
  | 'events'
  | 'settings'
  | 'admin';

type HomeBottomTabBarProps = {
  activeTab?: HomeTabKey;
  /** When true, shows the Admin tab (admin users only). */
  showAdminTab?: boolean;
  onTabPress?: (tab: HomeTabKey) => void;
};

const BASE_TABS: { key: HomeTabKey; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'courses', label: 'Learn', icon: BookOpen },
  { key: 'events', label: 'Events', icon: Calendar },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const ADMIN_TAB = { key: 'admin' as const, label: 'Admin', icon: Shield };

const ACTIVE_COLOR = colors.primary;
const INACTIVE_COLOR = colors.textMuted;

function HomeBottomTabBar({
  activeTab = 'home',
  showAdminTab = false,
  onTabPress,
}: HomeBottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const tabs = showAdminTab
    ? [BASE_TABS[0], BASE_TABS[1], ADMIN_TAB, BASE_TABS[2], BASE_TABS[3]]
    : BASE_TABS;

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}>
      {tabs.map(tab => {
        const isActive = tab.key === activeTab;
        const Icon = tab.icon;
        const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress?.(tab.key)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}>
            <View style={styles.iconWrap}>
              <Icon size={22} color={color} strokeWidth={isActive ? 2.5 : 2} />
            </View>
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrap: {
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default HomeBottomTabBar;

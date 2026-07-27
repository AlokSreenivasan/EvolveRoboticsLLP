import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GraduationCap,
  Home,
  ListTodo,
  Settings,
  Shield,
} from 'lucide-react-native';

import { cardShadowElevated, colors, glassBorder } from '../../constants/theme';

export type HomeTabKey =
  | 'home'
  | 'todo'
  | 'learning'
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
  { key: 'todo', label: 'To Do', icon: ListTodo },
  { key: 'learning', label: 'Learning', icon: GraduationCap },
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
        styles.shell,
        { paddingBottom: Math.max(insets.bottom, 10) },
      ]}>
      <View style={styles.container}>
        {tabs.map(tab => {
          const isActive = tab.key === activeTab;
          const Icon = tab.icon;
          const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => onTabPress?.(tab.key)}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}>
              <View
                style={[
                  styles.iconWrap,
                  isActive && styles.iconWrapActive,
                ]}>
                <Icon
                  size={20}
                  color={color}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  { color },
                  isActive && styles.labelActive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 28,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 4,
    ...glassBorder,
    ...cardShadowElevated,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: { elevation: 10 },
      default: {},
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconWrap: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconWrapActive: {
    backgroundColor: colors.primaryLight,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  labelActive: {
    fontWeight: '700',
  },
});

export default HomeBottomTabBar;

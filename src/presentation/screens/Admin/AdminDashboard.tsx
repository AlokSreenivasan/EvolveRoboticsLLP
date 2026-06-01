import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Bell,
  BookOpen,
  Calendar,
  ClipboardList,
  FolderOpen,
  ImageIcon,
  LayoutDashboard,
  Megaphone,
  PlayCircle,
  Users,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AdminScreenLayout from '../../../components/Admin/AdminScreenLayout';
import { colors, cardShadow, spacing } from '../../../constants/theme';
import type { AdminStackParamList } from '../../../types/navigation';

type AdminNav = NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>;

type AdminMenuItem = {
  key: keyof AdminStackParamList;
  title: string;
  description: string;
  icon: typeof LayoutDashboard;
};

const MENU_ITEMS: AdminMenuItem[] = [
  {
    key: 'ManageContinueLearningPlaylists',
    title: 'Continue Learning',
    description: 'Add YouTube playlists for the home carousel',
    icon: PlayCircle,
  },
  {
    key: 'ManageImportantUpdates',
    title: 'Important Updates',
    description: 'Edit home notices, titles, and section order',
    icon: Megaphone,
  },
  {
    key: 'ManageUpcomingEvents',
    title: 'Upcoming Events',
    description: 'Create and manage home event cards',
    icon: Calendar,
  },
  {
    key: 'ManageResources',
    title: 'Resources',
    description: 'Upload PDF notes with headings for Quick Access',
    icon: FolderOpen,
  },
  {
    key: 'ManageAssignments',
    title: 'Assignments',
    description: 'Publish PDF assignments with headings and due dates',
    icon: ClipboardList,
  },
  {
    key: 'ManageCourses',
    title: 'Manage Courses',
    description: 'Create, edit, and publish learning content',
    icon: BookOpen,
  },
  {
    key: 'ManageBanners',
    title: 'Manage Banners',
    description: 'Update home carousel and promotional banners',
    icon: ImageIcon,
  },
  {
    key: 'ManageUsers',
    title: 'Manage Users',
    description: 'View accounts and assign roles',
    icon: Users,
  },
  {
    key: 'AdminNotifications',
    title: 'Notifications',
    description: 'Send announcements and push campaigns',
    icon: Bell,
  },
];

function AdminDashboard() {
  const navigation = useNavigation<AdminNav>();

  return (
    <AdminScreenLayout
      title="Admin"
      subtitle="Manage app content, users, and communications">
      <View style={styles.heroCard}>
        <LayoutDashboard size={28} color={colors.primary} strokeWidth={2} />
        <Text style={styles.heroTitle}>Administrator dashboard</Text>
        <Text style={styles.heroText}>
          Choose a section below to manage the Evolve platform.
        </Text>
      </View>

      <View style={styles.menu}>
        {MENU_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.menuCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(item.key)}
              accessibilityRole="button"
              accessibilityLabel={item.title}>
              <View style={styles.menuIconWrap}>
                <Icon size={22} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </AdminScreenLayout>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: spacing.cardRadius,
    padding: 20,
    marginBottom: spacing.sectionGap,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    ...cardShadow,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  heroText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  menu: {
    gap: 12,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    marginRight: 8,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
  },
});

export default AdminDashboard;

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Bell,
  BookOpen,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  FolderKanban,
  FolderOpen,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  PlayCircle,
  School,
  Shield,
  Trophy,
  Users,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AdminScreenLayout from '../../../components/Admin/AdminScreenLayout';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import {
  colors,
  spacing,
  typography,
} from '../../../constants/theme';
import { useUserRole } from '../../hooks/useUserRole';
import type { AdminStackParamList } from '../../../types/navigation';
import { canAccessAdminDashboardScreen } from '../../../utils/admin/adminDashboardAccess';

type AdminNav = NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>;

type AdminMenuItem = {
  key: keyof AdminStackParamList;
  title: string;
  icon: typeof LayoutDashboard;
  /** When true, only superadmins see this tile (also enforced via route guard). */
  superadminOnly?: boolean;
};

const MENU_ITEMS: AdminMenuItem[] = [
  {
    key: 'ManageContinueLearningPlaylists',
    title: 'Lessons',
    icon: PlayCircle,
  },
  {
    key: 'ManageImportantUpdates',
    title: 'Important Updates',
    icon: Megaphone,
  },
  {
    key: 'ManageUpcomingEvents',
    title: 'Upcoming Events',
    icon: Calendar,
  },
  {
    key: 'ManageResources',
    title: 'Resources',
    icon: FolderOpen,
  },
  {
    key: 'ManageAssignments',
    title: 'Assignments',
    icon: ClipboardList,
  },
  {
    key: 'ManageExams',
    title: 'Exams',
    icon: ClipboardCheck,
  },
  {
    key: 'ManageQuizCompetitions',
    title: 'Quiz Competition',
    icon: Trophy,
  },
  {
    key: 'ManageCourses',
    title: 'Manage Courses',
    icon: BookOpen,
  },
  {
    key: 'ManageProjects',
    title: 'Projects',
    icon: FolderKanban,
  },
  {
    key: 'ManageRoles',
    title: 'Roles',
    icon: Shield,
    superadminOnly: true,
  },
  {
    key: 'ManageUsers',
    title: 'Manage Users',
    icon: Users,
  },
  {
    key: 'ManageSchools',
    title: 'Add Schools',
    icon: School,
  },
  {
    key: 'ManageChatKeywords',
    title: 'Chat Keywords',
    icon: MessageSquare,
  },
  {
    key: 'AdminNotifications',
    title: 'Notifications',
    icon: Bell,
  },
];

function AdminDashboard() {
  const navigation = useNavigation<AdminNav>();
  const { role, isSuperAdmin } = useUserRole();
  const visibleMenuItems = MENU_ITEMS.filter(item => {
    if (item.superadminOnly && !isSuperAdmin) {
      return false;
    }
    return canAccessAdminDashboardScreen(role, item.key);
  });

  return (
    <AdminScreenLayout title="Admin">
      <SurfaceCard elevation="default" tinted style={styles.heroCard}>
        <LayoutDashboard size={28} color={colors.primary} strokeWidth={2.15} />
        <Text style={styles.heroTitle}>Administrator dashboard</Text>
        <Text style={styles.heroText}>
          {isSuperAdmin
            ? 'Choose a section below to manage the Evolve platform.'
            : 'Choose a section below. Your admin account is limited to learning content tools.'}
        </Text>
      </SurfaceCard>

      <View style={styles.menu}>
        {visibleMenuItems.map(item => {
          const Icon = item.icon;
          return (
            <SurfaceCard key={item.key} elevation="default" style={styles.menuCard}>
              <TouchableOpacity
                style={styles.menuPressable}
                activeOpacity={0.85}
                onPress={() => navigation.navigate(item.key)}
                accessibilityRole="button"
                accessibilityLabel={item.title}>
                <View style={styles.menuIconWrap}>
                  <Icon size={20} color={colors.primary} strokeWidth={2.15} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </View>
                <View style={styles.chevronWrap}>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableOpacity>
            </SurfaceCard>
          );
        })}
      </View>
    </AdminScreenLayout>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    padding: 20,
    marginBottom: spacing.sectionGap,
    borderColor: colors.primaryMuted,
  },
  heroTitle: {
    ...typography.sectionTitle,
    marginTop: 12,
    marginBottom: 6,
  },
  heroText: {
    ...typography.bodySecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  menu: {
    gap: 12,
  },
  menuCard: {
    borderColor: colors.border,
  },
  menuPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: spacing.iconTileRadius,
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
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginTop: -2,
  },
});

export default AdminDashboard;

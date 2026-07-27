import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { signOut } from '../../../services/firebase/authService';
import { useNavigation } from '@react-navigation/native';
import {
  Bell,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Lock,
  ScrollText,
  Shield,
} from 'lucide-react-native';

import AppButton from '../../../components/AppButton.tsx';
import ProfileAvatar from '../../../components/Profile/ProfileAvatar.tsx';
import SettingsCard from '../../../components/Settings/SettingsCard';
import SettingsLinkRow from '../../../components/Settings/SettingsLinkRow';
import SettingsScreenLayout from '../../../components/Settings/SettingsScreenLayout';
import SettingsSectionHeader from '../../../components/Settings/SettingsSectionHeader';
import { colors, spacing, typography } from '../../../constants/theme';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { useAdminNavigation } from '../../hooks/useAdminNavigation';
import { useStoredProfileFullName } from '../../hooks/useStoredProfileFullName';
import { useUserRole } from '../../hooks/useUserRole';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';

function SettingsScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { user, profile, profileImage } = useAuth();
  const displayName = useStoredProfileFullName();
  const userEmail = profile?.email ?? user?.email ?? '';
  const { isAdmin, roleLoading } = useUserRole();
  const { openAdmin } = useAdminNavigation();
  const [loggingOut, setLoggingOut] = useState(false);

  const performLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } catch {
      appAlert(
        appAlertCopy.learner.logoutFailedTitle,
        appAlertCopy.learner.logoutFailedMessage,
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogoutPress = () => {
    appAlert(
      appAlertCopy.learner.logoutConfirmTitle,
      appAlertCopy.learner.logoutConfirmMessage,
      [
        { text: appAlertButtons.cancel, style: 'cancel' },
        { text: appAlertButtons.logOut, onPress: performLogout },
      ],
    );
  };

  return (
    <SettingsScreenLayout title="Settings">
      <SettingsCard style={styles.profileCard}>
        <View style={styles.profileRow}>
          <ProfileAvatar imageUri={profileImage} size={72} />
          <View style={styles.profileText}>
            <Text style={styles.userName} numberOfLines={2}>
              {displayName}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {userEmail}
            </Text>
          </View>
        </View>

        <AppButton
          title="Personal details"
          onPress={() => navigation.navigate('Profile')}
          variant="secondary"
        />
      </SettingsCard>

      {!roleLoading && isAdmin ? (
        <View style={styles.sectionBlock}>
          <SettingsSectionHeader title="Administrator" />
          <SettingsCard>
            <SettingsLinkRow
              icon={LayoutDashboard}
              iconColor={colors.primary}
              iconBackgroundColor={colors.primaryLight}
              title="Admin Dashboard"
              variant="link"
              onPress={() => openAdmin()}
              isLast
            />
          </SettingsCard>
        </View>
      ) : null}

      <View style={styles.sectionBlock}>
        <SettingsSectionHeader title="Account Settings" />
        <SettingsCard>
          <SettingsLinkRow
            icon={Lock}
            iconColor={colors.accentBlue}
            iconBackgroundColor="#E3F2FD"
            title="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <SettingsLinkRow
            icon={Shield}
            iconColor={colors.danger}
            iconBackgroundColor="#FFEBEE"
            title="Privacy Settings"
            onPress={() => navigation.navigate('PrivacySettings')}
          />
          <SettingsLinkRow
            icon={Bell}
            iconColor={colors.primary}
            iconBackgroundColor={colors.primaryLight}
            title="Notification Preferences"
            onPress={() => navigation.navigate('NotificationPreferences')}
            isLast
          />
        </SettingsCard>
      </View>

      <View style={styles.sectionBlock}>
        <SettingsSectionHeader title="Help & Support" />
        <SettingsCard>
          <SettingsLinkRow
            icon={HelpCircle}
            iconColor={colors.accentOrange}
            iconBackgroundColor="#FFF3E0"
            title="Support"
            onPress={() => navigation.navigate('Support')}
            isLast
          />
        </SettingsCard>
      </View>

      <View style={styles.sectionBlock}>
        <SettingsSectionHeader title="App Information" />
        <SettingsCard>
          <SettingsLinkRow title="Version" subtitle="2.1.1" />
          <SettingsLinkRow
            icon={FileText}
            iconColor={colors.primary}
            iconBackgroundColor={colors.primaryLight}
            title="Privacy Policy"
            variant="link"
          />
          <SettingsLinkRow
            icon={ScrollText}
            iconColor={colors.primary}
            iconBackgroundColor={colors.primaryLight}
            title="Terms of Service"
            variant="link"
            isLast
          />
        </SettingsCard>
      </View>

      <AppButton
        title={loggingOut ? 'Logging out...' : 'Log Out'}
        onPress={handleLogoutPress}
        variant="ghost"
        disabled={loggingOut}
        loading={loggingOut}
      />
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  sectionBlock: {
    marginBottom: spacing.sectionGap,
  },
  profileCard: {
    padding: 18,
    marginBottom: spacing.sectionGap,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileText: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    ...typography.screenTitle,
    fontSize: 22,
    marginBottom: 4,
  },
  userEmail: {
    ...typography.bodySecondary,
    fontSize: 14,
  },
});

export default SettingsScreen;

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Shield } from 'lucide-react-native';

import AppButton from '../../../components/AppButton.tsx';
import DeleteAccountConfirmModal from '../../../components/Settings/DeleteAccountConfirmModal';
import SettingsInfoCard from '../../../components/Settings/SettingsInfoCard';
import SettingsScreenLayout from '../../../components/Settings/SettingsScreenLayout';
import SettingsSectionHeader from '../../../components/Settings/SettingsSectionHeader';
import { cardShadowLight, colors, spacing } from '../../../constants/theme';
import { deleteAccount } from '../../../services/firebase/deleteAccountService';
import { hasEmailPasswordProvider } from '../../../services/firebase/authService';
import { appAlert, appAlertCopy } from '../../../utils/alert/appAlert';

function PrivacySettingsScreen() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const requiresPassword = hasEmailPasswordProvider();

  const handleDeletePress = () => {
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    if (!deleting) {
      setShowDeleteModal(false);
    }
  };

  const handleConfirmDelete = async (currentPassword?: string) => {
    setDeleting(true);

    try {
      await deleteAccount({ currentPassword });
      setShowDeleteModal(false);
      appAlert(
        appAlertCopy.learner.accountDeletedTitle,
        appAlertCopy.learner.accountDeletedMessage,
      );
    } catch (error) {
      appAlert(
        appAlertCopy.learner.accountDeletionFailedTitle,
        error instanceof Error
          ? error.message
          : appAlertCopy.learner.accountDeletionFailedMessage,
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SettingsScreenLayout
      title="Privacy Settings"
      backDisabled={deleting}>
      <SettingsInfoCard
        icon={Shield}
        title="Your privacy"
        description="Manage how your account and personal data are handled in the app."
      />

      <View style={styles.sectionBlock}>
        <SettingsSectionHeader title="Danger zone" />
        <View style={styles.dangerCard}>
          <Text style={styles.dangerDescription}>
            Permanently delete your account and remove your profile, sign-in
            access, and associated user data. This cannot be undone.
          </Text>

          <AppButton
            title="Delete Account"
            onPress={handleDeletePress}
            variant="danger"
            disabled={deleting}
            loading={deleting}
          />
        </View>
      </View>

      <DeleteAccountConfirmModal
        visible={showDeleteModal}
        requiresPassword={requiresPassword}
        loading={deleting}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  sectionBlock: {
    marginBottom: spacing.sectionGap,
  },
  dangerCard: {
    backgroundColor: colors.dangerLight,
    borderRadius: spacing.cardRadiusLg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.danger,
    ...cardShadowLight,
  },
  dangerDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 16,
  },
});

export default PrivacySettingsScreen;

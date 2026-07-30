import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff, Lock } from 'lucide-react-native';

import AppButton from '../../../components/AppButton.tsx';
import SettingsCard from '../../../components/Settings/SettingsCard';
import SettingsInfoCard from '../../../components/Settings/SettingsInfoCard';
import SettingsScreenLayout from '../../../components/Settings/SettingsScreenLayout';
import SettingsSectionHeader from '../../../components/Settings/SettingsSectionHeader';
import { colors, inputFieldStyle, spacing, typography } from '../../../constants/theme';
import { hasEmailPasswordProvider } from '../../../services/firebase/authService';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';
import { useChangePasswordForm } from '../../hooks/useChangePasswordForm';

function ChangePasswordScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [isCurrentVisible, setIsCurrentVisible] = useState(false);
  const [isNewVisible, setIsNewVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const {
    currentPassword,
    newPassword,
    confirmNewPassword,
    errors,
    isSubmitting,
    setCurrentPassword,
    setNewPassword,
    setConfirmNewPassword,
    submitPasswordChange,
  } = useChangePasswordForm();

  useEffect(() => {
    if (!hasEmailPasswordProvider()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleUpdatePassword = async () => {
    const result = await submitPasswordChange();

    if (!result.success) {
      if (result.message) {
        appAlert(appAlertCopy.learner.passwordUpdateFailedTitle, result.message);
      }
      return;
    }

    appAlert(
      appAlertCopy.learner.passwordUpdatedTitle,
      appAlertCopy.learner.passwordUpdatedMessage,
      [{ text: appAlertButtons.continue, onPress: () => navigation.goBack() }],
    );
  };

  return (
    <SettingsScreenLayout
      title="Change Password"
      backDisabled={isSubmitting}
      keyboardAvoiding
      keyboardShouldPersistTaps="handled">
      <SettingsInfoCard
        icon={Lock}
        title="Update your password"
        description="Enter your current password, then choose a new one."
      />

      <View style={styles.sectionBlock}>
        <SettingsSectionHeader title="New credentials" />
        <SettingsCard style={styles.formCard}>
          <Text style={styles.label}>Current Password</Text>
          <View
            style={[
              styles.passwordRow,
              errors.currentPassword ? styles.inputError : null,
            ]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter current password"
              placeholderTextColor={colors.textMuted}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!isCurrentVisible}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
            />
            <TouchableOpacity
              onPress={() => setIsCurrentVisible(v => !v)}
              style={styles.passwordToggle}
              disabled={isSubmitting}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={isCurrentVisible ? 'Hide password' : 'Show password'}
            >
              {isCurrentVisible ? (
                <EyeOff size={20} color={colors.primary} />
              ) : (
                <Eye size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          {errors.currentPassword ? (
            <Text style={styles.errorText}>{errors.currentPassword}</Text>
          ) : null}

          <Text style={styles.label}>New Password</Text>
          <View
            style={[
              styles.passwordRow,
              errors.newPassword ? styles.inputError : null,
            ]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter new password"
              placeholderTextColor={colors.textMuted}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!isNewVisible}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
            />
            <TouchableOpacity
              onPress={() => setIsNewVisible(v => !v)}
              style={styles.passwordToggle}
              disabled={isSubmitting}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={isNewVisible ? 'Hide password' : 'Show password'}
            >
              {isNewVisible ? (
                <EyeOff size={20} color={colors.primary} />
              ) : (
                <Eye size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          {errors.newPassword ? (
            <Text style={styles.errorText}>{errors.newPassword}</Text>
          ) : null}

          <Text style={styles.label}>Confirm New Password</Text>
          <View
            style={[
              styles.passwordRow,
              errors.confirmNewPassword ? styles.inputError : null,
            ]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Re-enter new password"
              placeholderTextColor={colors.textMuted}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry={!isConfirmVisible}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
            />
            <TouchableOpacity
              onPress={() => setIsConfirmVisible(v => !v)}
              style={styles.passwordToggle}
              disabled={isSubmitting}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={isConfirmVisible ? 'Hide password' : 'Show password'}
            >
              {isConfirmVisible ? (
                <EyeOff size={20} color={colors.primary} />
              ) : (
                <Eye size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          {errors.confirmNewPassword ? (
            <Text style={styles.errorText}>{errors.confirmNewPassword}</Text>
          ) : null}

          <AppButton
            title="Update Password"
            onPress={handleUpdatePassword}
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            buttonStyle={styles.saveButton}
          />
        </SettingsCard>
      </View>
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  sectionBlock: {
    marginBottom: spacing.sectionGap,
  },
  formCard: {
    padding: 16,
  },
  label: {
    ...typography.label,
    color: colors.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    ...inputFieldStyle,
    paddingVertical: 0,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  passwordToggle: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 20,
  },
});

export default ChangePasswordScreen;

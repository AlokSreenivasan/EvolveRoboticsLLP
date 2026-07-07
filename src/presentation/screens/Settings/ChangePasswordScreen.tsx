import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { colors, spacing } from '../../../constants/theme';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
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

  const handleUpdatePassword = async () => {
    const result = await submitPasswordChange();

    if (!result.success) {
      if (result.message) {
        Alert.alert('Update Failed', result.message);
      }
      return;
    }

    Alert.alert(
      'Password Updated',
      'Your password has been changed successfully.',
      [{ text: 'OK', onPress: () => navigation.goBack() }],
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
          <View style={styles.passwordRow}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                errors.currentPassword ? styles.inputError : null,
              ]}
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
          <View style={styles.passwordRow}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                errors.newPassword ? styles.inputError : null,
              ]}
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
          <View style={styles.passwordRow}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                errors.confirmNewPassword ? styles.inputError : null,
              ]}
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
            title={isSubmitting ? 'Updating...' : 'Update Password'}
            onPress={handleUpdatePassword}
            buttonStyle={styles.saveButton}
            textStyle={styles.saveButtonText}
            disabled={isSubmitting}
          />
          {isSubmitting ? (
            <ActivityIndicator
              color={colors.primary}
              style={styles.saveLoader}
            />
          ) : null}
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
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
    fontSize: 14,
    color: colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
    backgroundColor: colors.surface,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0,
    marginBottom: 0,
    backgroundColor: 'transparent',
  },
  passwordToggle: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputError: {
    borderColor: '#e57373',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  saveLoader: {
    marginTop: 12,
    alignSelf: 'center',
  },
});

export default ChangePasswordScreen;

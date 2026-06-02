import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import AppButton from '../../../components/AppButton.tsx';
import BackButton, { backButtonOverlayStyle } from '../../../components/BackButton';
import Header from '../../../components/Header.tsx';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { useChangePasswordForm } from '../../hooks/useChangePasswordForm';

function ChangePasswordScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.screenHeader}>
          <BackButton
            style={backButtonOverlayStyle}
            disabled={isSubmitting}
          />
          <Header title="Change Password" />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.pageSubtitle}>
            Enter your current password, then choose a new one.
          </Text>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Update Password</Text>

            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.currentPassword ? styles.inputError : null,
              ]}
              placeholder="Enter current password"
              placeholderTextColor="#999"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
            />
            {errors.currentPassword ? (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            ) : null}

            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.newPassword ? styles.inputError : null,
              ]}
              placeholder="Enter new password"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
            />
            {errors.newPassword ? (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            ) : null}

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmNewPassword ? styles.inputError : null,
              ]}
              placeholder="Re-enter new password"
              placeholderTextColor="#999"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
            />
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
              <ActivityIndicator color="#a42a8b" style={styles.saveLoader} />
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screenHeader: {
    backgroundColor: '#fff',
    height: 80,
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eecdf4',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#a42a8b',
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eecdf4',
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
    fontSize: 14,
    color: '#a42a8b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eecdf4',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#e57373',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#a42a8b',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveLoader: {
    marginTop: 12,
    alignSelf: 'center',
  },
});

export default ChangePasswordScreen;

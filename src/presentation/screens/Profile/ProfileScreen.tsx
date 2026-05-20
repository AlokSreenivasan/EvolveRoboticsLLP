import React from 'react';
import {
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
import Header from '../../../components/Header.tsx';
import ProfilePhotoSection from '../../../components/Profile/ProfilePhotoSection.tsx';
import { CONTACT_NUMBER_MAX_LENGTH } from '../../../domain/Profile/validation/formatContactNumber';
import { useProfileForm } from '../../hooks/useProfileForm';
import {
  pickProfilePhotoFromGallery,
  showPhotoPickerError,
} from '../../../services/profilePhotoPicker';
import type { LoginScreenNavigationProp } from '../../../types/navigation';

function ProfileScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const {
    profile,
    errors,
    isLoading,
    setFullName,
    setContactNumber,
    setPhotoUri,
    validate,
    persistProfile,
  } = useProfileForm();

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    await persistProfile();

    Alert.alert(
      'Profile Updated',
      'Your changes have been saved locally. Syncing across the app will be added in a later update.',
    );
  };

  const handleChangePhoto = async () => {
    const result = await pickProfilePhotoFromGallery();

    if (result.success) {
      setPhotoUri(result.uri);
      return;
    }

    if (!result.cancelled && result.message) {
      showPhotoPickerError(result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Header title="Profile" />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* <Text style={styles.pageTitle}>Edit Profile</Text> */}
          <Text style={styles.pageSubtitle}>
            Update your personal details below.
          </Text>

          <ProfilePhotoSection
            photoUri={profile.photoUri}
            onChangePhotoPress={handleChangePhoto}
          />

          <View style={styles.formCard}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.fullName ? styles.inputError : null]}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={profile.fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              editable={!isLoading}
            />
            {errors.fullName ? (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            ) : null}

            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={[
                styles.input,
                errors.contactNumber ? styles.inputError : null,
              ]}
              placeholder="Enter 10-digit contact number"
              placeholderTextColor="#999"
              value={profile.contactNumber}
              onChangeText={setContactNumber}
              keyboardType="number-pad"
              maxLength={CONTACT_NUMBER_MAX_LENGTH}
              inputMode="numeric"
            />
            {errors.contactNumber ? (
              <Text style={styles.errorText}>{errors.contactNumber}</Text>
            ) : null}

            <AppButton
              title="Save Changes"
              onPress={handleSave}
              buttonStyle={styles.saveButton}
              textStyle={styles.saveButtonText}
            />
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
  backButton: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 2,
  },
  backText: {
    color: '#a42a8b',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 8,
  },
  formCard: {
    backgroundColor: '#fafafa',
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eecdf4',
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
    fontSize: 14,
    color: '#a42a8b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eecdf4',
    borderRadius: 12,
    paddingHorizontal: 14,
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
    color: '#d32f2f',
    fontSize: 13,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#a42a8b',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;

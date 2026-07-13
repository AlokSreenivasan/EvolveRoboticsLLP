import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import AppButton from '../../../components/AppButton.tsx';
import BackButton, { backButtonOverlayStyle } from '../../../components/BackButton';
import Header from '../../../components/Header.tsx';
import ProfilePhotoSection from '../../../components/Profile/ProfilePhotoSection.tsx';
import GradePicker from '../../../components/Profile/GradePicker.tsx';
import ProfileTrackPicker from '../../../components/Profile/ProfileTrackPicker.tsx';
import SchoolPicker from '../../../components/Profile/SchoolPicker.tsx';
import { CONTACT_NUMBER_MAX_LENGTH } from '../../../domain/Profile/validation/formatContactNumber';
import { isProfileComplete } from '../../../domain/Profile/validation/isProfileComplete';
import { useAuth } from '../../context/AuthContext';
import { useProfileForm } from '../../hooks/useProfileForm';
import { useSchools } from '../../hooks/useSchools';
import {
  pickProfilePhotoFromGallery,
  showPhotoPickerError,
} from '../../../services/profilePhotoPicker';
import type { RootStackParamList } from '../../../types/navigation';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute<ProfileScreenRouteProp>();
  const requireCompletion = route.params?.requireCompletion === true;
  const { user, profile: userProfile, profileLoading, isAdmin } = useAuth();
  const userEmail = userProfile?.email ?? user?.email ?? '';
  const {
    profile,
    errors,
    isLoading,
    isSaving,
    saveError,
    setFullName,
    setContactNumber,
    setTrack,
    setPhotoUri,
    setSchoolId,
    setGrade,
    validate,
    persistProfile,
  } = useProfileForm();
  const {
    schools,
    loading: schoolsLoading,
    error: schoolsError,
  } = useSchools();

  const isFormDisabled = isLoading || isSaving;
  const showSchoolAndGrade = profile.track === 'kids';

  useEffect(() => {
    if (!requireCompletion || profileLoading) {
      return;
    }

    if (isProfileComplete(userProfile)) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [navigation, profileLoading, requireCompletion, userProfile]);

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !requireCompletion,
    });
  }, [navigation, requireCompletion]);

  useEffect(() => {
    if (!requireCompletion) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [requireCompletion]);

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    const success = await persistProfile();

    if (success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      return;
    }

    Alert.alert(
      'Save Failed',
      saveError ?? 'Could not save your profile. Please try again.',
    );
  };

  const handleChangePhoto = async () => {
    if (isFormDisabled) {
      return;
    }
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
          {!requireCompletion ? (
            <BackButton
              style={backButtonOverlayStyle}
              disabled={isFormDisabled}
            />
          ) : null}
          <Header title="Profile" />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.pageSubtitle}>
            {requireCompletion
              ? 'Complete your profile to get started.'
              : 'Update your personal details below.'}
          </Text>

          <View style={styles.photoCard}>
            <ProfilePhotoSection
              photoUri={profile.photoUri}
              onChangePhotoPress={isFormDisabled ? undefined : handleChangePhoto}
            />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Personal Details</Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.fullName ? styles.inputError : null]}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={profile.fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              editable={!isFormDisabled}
            />
            {errors.fullName ? (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            ) : null}

            <View style={styles.labelRow}>
              <Text style={styles.labelInRow}>Email</Text>
              <Text style={styles.readOnlyBadge}>Read only</Text>
            </View>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText} numberOfLines={2}>
                {userEmail || '—'}
              </Text>
            </View>

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
              editable={!isFormDisabled}
            />
            {errors.contactNumber ? (
              <Text style={styles.errorText}>{errors.contactNumber}</Text>
            ) : null}

            {!isAdmin ? (
              <>
                <ProfileTrackPicker
                  selectedTrack={profile.track}
                  onSelectTrack={setTrack}
                  disabled={isFormDisabled}
                  hasError={Boolean(errors.track)}
                />
                {errors.track ? (
                  <Text style={styles.errorText}>{errors.track}</Text>
                ) : null}
              </>
            ) : null}

            {showSchoolAndGrade ? (
              <>
                <Text style={styles.label}>School</Text>
                <SchoolPicker
                  schools={schools}
                  selectedSchoolId={profile.schoolId}
                  onSelectSchool={setSchoolId}
                  loading={schoolsLoading}
                  error={schoolsError}
                  disabled={isFormDisabled}
                  hasError={Boolean(errors.schoolId)}
                />
                {errors.schoolId ? (
                  <Text style={styles.errorText}>{errors.schoolId}</Text>
                ) : null}

                <Text style={styles.label}>Grade</Text>
                <GradePicker
                  selectedGrade={profile.grade}
                  onSelectGrade={setGrade}
                  disabled={isFormDisabled}
                  hasError={Boolean(errors.grade)}
                />
                {errors.grade ? (
                  <Text style={styles.errorText}>{errors.grade}</Text>
                ) : null}
              </>
            ) : null}

            {saveError && !isSaving ? (
              <Text style={styles.errorText}>{saveError}</Text>
            ) : null}

            <AppButton
              title={
                isSaving
                  ? 'Saving...'
                  : requireCompletion
                    ? 'Save & Continue'
                    : 'Save Changes'
              }
              onPress={handleSave}
              buttonStyle={styles.saveButton}
              textStyle={styles.saveButtonText}
              disabled={isFormDisabled}
            />
            {isSaving ? (
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
  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#a42a8b',
    textAlign: 'center',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  photoCard: {
    backgroundColor: '#FAF2FF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eecdf4',
    paddingVertical: 8,
    marginBottom: 16,
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  labelInRow: {
    fontWeight: '600',
    fontSize: 14,
    color: '#a42a8b',
  },
  readOnlyBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#a42a8b',
    backgroundColor: '#FAF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eecdf4',
    overflow: 'hidden',
  },
  readOnlyField: {
    borderWidth: 1,
    borderColor: '#eecdf4',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FAF2FF',
    marginBottom: 4,
  },
  readOnlyText: {
    fontSize: 16,
    color: '#555',
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

export default ProfileScreen;

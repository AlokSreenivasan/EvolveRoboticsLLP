import React, { useEffect } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import AppButton from '../../../components/AppButton.tsx';
import ProfilePhotoSection from '../../../components/Profile/ProfilePhotoSection.tsx';
import GradePicker from '../../../components/Profile/GradePicker.tsx';
import ProfileTrackPicker from '../../../components/Profile/ProfileTrackPicker.tsx';
import SchoolPicker from '../../../components/Profile/SchoolPicker.tsx';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import SurfaceCard from '../../../components/ui/SurfaceCard';
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
import { appAlert, appAlertCopy } from '../../../utils/alert/appAlert';
import {
  colors,
  inputFieldStyle,
  spacing,
  typography,
} from '../../../constants/theme';

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
    isSchoolLocked,
    isGradeLocked,
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
  const schoolAndGradeLocked = isSchoolLocked || isGradeLocked;

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

    appAlert(
      appAlertCopy.learner.profileSaveFailedTitle,
      saveError ?? appAlertCopy.learner.profileSaveFailedMessage,
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

  const subtitle = requireCompletion
    ? 'Complete your profile to get started.'
    : 'Update your personal details below.';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title="Profile"
          subtitle={subtitle}
          showBack={!requireCompletion}
          backDisabled={isFormDisabled}
          compact
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <SurfaceCard elevation="light" tinted style={styles.photoCard}>
            <ProfilePhotoSection
              photoUri={profile.photoUri}
              onChangePhotoPress={isFormDisabled ? undefined : handleChangePhoto}
            />
          </SurfaceCard>

          <SurfaceCard elevation="default" style={styles.formCard}>
            <Text style={styles.sectionTitle}>Personal Details</Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.fullName ? styles.inputError : null]}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textMuted}
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
              placeholderTextColor={colors.textMuted}
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
                  disabled={isFormDisabled || isSchoolLocked}
                  hasError={Boolean(errors.schoolId)}
                />
                {errors.schoolId ? (
                  <Text style={styles.errorText}>{errors.schoolId}</Text>
                ) : null}

                <Text style={styles.label}>Grade</Text>
                <GradePicker
                  selectedGrade={profile.grade}
                  onSelectGrade={setGrade}
                  disabled={isFormDisabled || isGradeLocked}
                  hasError={Boolean(errors.grade)}
                />
                {errors.grade ? (
                  <Text style={styles.errorText}>{errors.grade}</Text>
                ) : null}
                {schoolAndGradeLocked ? (
                  <Text style={styles.helperText}>
                    School and grade cannot be changed once saved.
                  </Text>
                ) : null}
              </>
            ) : null}

            {saveError && !isSaving ? (
              <Text style={styles.errorText}>{saveError}</Text>
            ) : null}

            <AppButton
              title={
                requireCompletion
                  ? 'Save & Continue'
                  : 'Save Changes'
              }
              onPress={handleSave}
              variant="primary"
              loading={isSaving}
              disabled={isFormDisabled}
              buttonStyle={styles.saveButton}
            />
          </SurfaceCard>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.screenHorizontal,
    paddingBottom: 32,
    gap: 16,
  },
  photoCard: {
    paddingVertical: 8,
  },
  formCard: {
    padding: 16,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.primary,
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryMuted,
  },
  label: {
    ...typography.label,
    color: colors.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  labelInRow: {
    ...typography.label,
    color: colors.primary,
  },
  readOnlyBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: spacing.chipRadius,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    overflow: 'hidden',
  },
  readOnlyField: {
    ...inputFieldStyle,
    backgroundColor: colors.primaryLight,
    marginBottom: 4,
  },
  readOnlyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  input: {
    ...inputFieldStyle,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 8,
  },
  helperText: {
    ...typography.bodySecondary,
    marginTop: 4,
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 20,
  },
});

export default ProfileScreen;

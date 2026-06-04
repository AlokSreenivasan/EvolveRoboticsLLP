import { useCallback, useEffect, useRef, useState } from 'react';

import { emptyProfile, Profile } from '../../domain/Profile/models/Profile';
import { formatContactNumberInput } from '../../domain/Profile/validation/formatContactNumber';
import { formatFullName } from '../../domain/Profile/validation/formatFullName';
import {
  hasProfileFormErrors,
  ProfileFormErrors,
  validateProfileForm,
} from '../../domain/Profile/validation/validateProfileForm';
import { useAuth } from '../context/AuthContext';
import { userProfileToFormProfile } from '../../utils/profile/mapUserProfile';

export function useProfileForm() {
  const {
    profile: sessionProfile,
    profileLoading,
    profileSaving,
    profileError,
    updateSessionProfile,
  } = useAuth();

  const [profileForm, setProfileForm] = useState<Profile>(emptyProfile);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (!sessionProfile) {
      return;
    }

    const nextForm = userProfileToFormProfile(sessionProfile);

    if (!isDirtyRef.current) {
      setProfileForm(nextForm);
      return;
    }

    // Sign-up hydration can complete after Profile mounts — sync empty fields only.
    setProfileForm(prev => ({
      fullName: prev.fullName || nextForm.fullName,
      contactNumber: prev.contactNumber || nextForm.contactNumber,
      photoUri: prev.photoUri ?? nextForm.photoUri,
      schoolId: prev.schoolId ?? nextForm.schoolId,
    }));
  }, [sessionProfile]);

  const markDirty = useCallback(() => {
    isDirtyRef.current = true;
  }, []);

  const setFullName = useCallback((value: string) => {
    markDirty();
    setProfileForm(prev => ({ ...prev, fullName: formatFullName(value) }));
    setErrors(prev => ({ ...prev, fullName: undefined }));
  }, [markDirty]);

  const setContactNumber = useCallback((value: string) => {
    markDirty();
    setProfileForm(prev => ({
      ...prev,
      contactNumber: formatContactNumberInput(value),
    }));
    setErrors(prev => ({ ...prev, contactNumber: undefined }));
  }, [markDirty]);

  const setPhotoUri = useCallback((uri: string | null) => {
    markDirty();
    setProfileForm(prev => ({ ...prev, photoUri: uri }));
  }, [markDirty]);

  const setSchoolId = useCallback((schoolId: string | null) => {
    markDirty();
    setProfileForm(prev => ({ ...prev, schoolId }));
    setErrors(prev => ({ ...prev, schoolId: undefined }));
  }, [markDirty]);

  const validate = useCallback((): boolean => {
    const nextErrors = validateProfileForm({
      fullName: profileForm.fullName,
      contactNumber: profileForm.contactNumber,
      schoolId: profileForm.schoolId,
    });
    setErrors(nextErrors);
    return !hasProfileFormErrors(nextErrors);
  }, [
    profileForm.contactNumber,
    profileForm.fullName,
    profileForm.schoolId,
  ]);

  const persistProfile = useCallback(async (): Promise<boolean> => {
    const success = await updateSessionProfile({
      fullName: profileForm.fullName,
      phoneNumber: profileForm.contactNumber,
      photoUri: profileForm.photoUri,
      schoolId: profileForm.schoolId,
    });

    if (success) {
      isDirtyRef.current = false;
    }

    return success;
  }, [profileForm, updateSessionProfile]);

  return {
    profile: profileForm,
    errors,
    isLoading: profileLoading,
    isSaving: profileSaving,
    saveError: profileError,
    setFullName,
    setContactNumber,
    setPhotoUri,
    setSchoolId,
    validate,
    persistProfile,
  };
}

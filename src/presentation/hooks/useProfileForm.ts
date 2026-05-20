import { useCallback, useEffect, useState } from 'react';

import { emptyProfile, Profile } from '../../domain/Profile/models/Profile';
import { formatContactNumberInput } from '../../domain/Profile/validation/formatContactNumber';
import { formatFullName } from '../../domain/Profile/validation/formatFullName';
import {
  hasProfileFormErrors,
  ProfileFormErrors,
  validateProfileForm,
} from '../../domain/Profile/validation/validateProfileForm';
import {
  getProfileContactNumber,
  getProfileFullName,
  getProfilePhotoUri,
  saveProfileContactNumber,
} from '../../services/profileStorage';
import { useProfileDisplay } from '../context/ProfileDisplayContext';

export function useProfileForm() {
  const { setDisplayName, setProfilePhotoUri } = useProfileDisplay();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadStoredProfile = async () => {
      try {
        const [storedFullName, storedPhotoUri, storedContactNumber] =
          await Promise.all([
            getProfileFullName(),
            getProfilePhotoUri(),
            getProfileContactNumber(),
          ]);
        if (!cancelled) {
          setProfile(prev => ({
            ...prev,
            ...(storedFullName ? { fullName: storedFullName } : {}),
            ...(storedPhotoUri ? { photoUri: storedPhotoUri } : {}),
            ...(storedContactNumber
              ? {
                  contactNumber: formatContactNumberInput(storedContactNumber),
                }
              : {}),
          }));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadStoredProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const setFullName = useCallback((value: string) => {
    setProfile(prev => ({ ...prev, fullName: formatFullName(value) }));
    setErrors(prev => ({ ...prev, fullName: undefined }));
  }, []);

  const setContactNumber = useCallback((value: string) => {
    setProfile(prev => ({
      ...prev,
      contactNumber: formatContactNumberInput(value),
    }));
    setErrors(prev => ({ ...prev, contactNumber: undefined }));
  }, []);

  const setPhotoUri = useCallback((uri: string | null) => {
    setProfile(prev => ({ ...prev, photoUri: uri }));
  }, []);

  const validate = useCallback((): boolean => {
    const nextErrors = validateProfileForm({
      fullName: profile.fullName,
      contactNumber: profile.contactNumber,
    });
    setErrors(nextErrors);
    return !hasProfileFormErrors(nextErrors);
  }, [profile.contactNumber, profile.fullName]);

  const persistProfile = useCallback(async (): Promise<void> => {
    await Promise.all([
      setDisplayName(profile.fullName),
      setProfilePhotoUri(profile.photoUri),
      saveProfileContactNumber(profile.contactNumber),
    ]);
  }, [
    profile.contactNumber,
    profile.fullName,
    profile.photoUri,
    setDisplayName,
    setProfilePhotoUri,
  ]);

  return {
    profile,
    errors,
    isLoading,
    setFullName,
    setContactNumber,
    setPhotoUri,
    validate,
    persistProfile,
  };
};

import { useCallback, useEffect, useState } from 'react';

import { emptyProfile, Profile } from '../../domain/Profile/models/Profile';
import { formatFullName } from '../../domain/Profile/validation/formatFullName';
import {
  hasProfileFormErrors,
  ProfileFormErrors,
  validateProfileForm,
} from '../../domain/Profile/validation/validateProfileForm';
import {
  getProfileFullName,
  getProfilePhotoUri,
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
        const [storedFullName, storedPhotoUri] = await Promise.all([
          getProfileFullName(),
          getProfilePhotoUri(),
        ]);
        if (!cancelled) {
          setProfile(prev => ({
            ...prev,
            ...(storedFullName ? { fullName: storedFullName } : {}),
            ...(storedPhotoUri ? { photoUri: storedPhotoUri } : {}),
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
    setProfile(prev => ({ ...prev, contactNumber: value }));
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
    ]);
  }, [profile.fullName, profile.photoUri, setDisplayName, setProfilePhotoUri]);

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

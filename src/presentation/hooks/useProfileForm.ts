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
  saveProfileFullName,
} from '../../services/profileStorage';

export function useProfileForm() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadStoredProfile = async () => {
      try {
        const storedFullName = await getProfileFullName();
        if (!cancelled && storedFullName) {
          setProfile(prev => ({ ...prev, fullName: storedFullName }));
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
    await saveProfileFullName(profile.fullName);
  }, [profile.fullName]);

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

import { useCallback, useState } from 'react';

import { emptyProfile, Profile } from '../../domain/Profile/models/Profile';
import { formatFullName } from '../../domain/Profile/validation/formatFullName';
import {
  hasProfileFormErrors,
  ProfileFormErrors,
  validateProfileForm,
} from '../../domain/Profile/validation/validateProfileForm';

export function useProfileForm() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [errors, setErrors] = useState<ProfileFormErrors>({});

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

  return {
    profile,
    errors,
    setFullName,
    setContactNumber,
    setPhotoUri,
    validate,
  };
}

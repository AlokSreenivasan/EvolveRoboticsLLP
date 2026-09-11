import { useCallback } from 'react';

import { useAuth } from '../../presentation/context/AuthContext';
import type { UpdateUserProfileInput, UserProfile } from '../../store/user/types';
import type { AsyncState } from '../../store/user/types/asyncState.types';

type UseUserProfileResult = AsyncState<UserProfile> & {
  refresh: () => Promise<void>;
  updateProfile: (input: UpdateUserProfileInput) => Promise<UserProfile | null>;
};

/**
 * @deprecated Prefer `useAuth()` — single auth listener and shared profile state.
 * Thin wrapper for legacy imports; does not register extra Firestore listeners.
 */
export function useUserProfile(): UseUserProfileResult {
  const {
    profile,
    profileLoading,
    profileError,
    refreshProfile,
    updateSessionProfile,
  } = useAuth();

  const refresh = useCallback(async () => {
    await refreshProfile();
  }, [refreshProfile]);

  const updateProfile = useCallback(
    async (input: UpdateUserProfileInput): Promise<UserProfile | null> => {
      if (!profile) {
        return null;
      }

      const success = await updateSessionProfile({
        fullName: input.fullName ?? profile.fullName,
        phoneNumber: input.phoneNumber ?? profile.phoneNumber,
        photoUri:
          input.profileImage !== undefined
            ? input.profileImage
            : profile.profileImage,
        schoolId:
          input.schoolId !== undefined ? input.schoolId : profile.schoolId,
        grade: input.grade !== undefined ? input.grade : profile.grade,
        track: input.track !== undefined ? input.track : profile.track,
        birthYear:
          input.birthYear !== undefined ? input.birthYear : profile.birthYear,
        parentalConsentAtMs:
          input.parentalConsentAtMs !== undefined
            ? input.parentalConsentAtMs
            : profile.parentalConsentAtMs,
      });

      if (!success) {
        return null;
      }

      return {
        ...profile,
        fullName: input.fullName ?? profile.fullName,
        phoneNumber: input.phoneNumber ?? profile.phoneNumber,
        profileImage:
          input.profileImage !== undefined
            ? input.profileImage
            : profile.profileImage,
        schoolId:
          input.schoolId !== undefined ? input.schoolId : profile.schoolId,
        grade: input.grade !== undefined ? input.grade : profile.grade,
        track: input.track !== undefined ? input.track : profile.track,
        birthYear:
          input.birthYear !== undefined ? input.birthYear : profile.birthYear,
        parentalConsentAtMs:
          input.parentalConsentAtMs !== undefined
            ? input.parentalConsentAtMs
            : profile.parentalConsentAtMs,
      };
    },
    [profile, updateSessionProfile],
  );

  return {
    data: profile,
    loading: profileLoading,
    error: profileError,
    refresh,
    updateProfile,
  };
}

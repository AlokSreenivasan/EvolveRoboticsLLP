import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { emptyProfile, Profile } from '../../domain/Profile/models/Profile';
import { formatContactNumberInput } from '../../domain/Profile/validation/formatContactNumber';
import { formatFullName } from '../../domain/Profile/validation/formatFullName';
import {
  hasProfileFormErrors,
  ProfileFormErrors,
  validateProfileForm,
} from '../../domain/Profile/validation/validateProfileForm';
import type { CourseTrack } from '../../store/content/types/courses.types';
import { useAuth } from '../context/AuthContext';
import { userProfileToFormProfile } from '../../utils/profile/mapUserProfile';
import {
  isSchoolOrGradeLocked,
  resolveWritableGrade,
  resolveWritableSchoolId,
} from '../../utils/profile/schoolGradeLock';

export function useProfileForm() {
  const {
    profile: sessionProfile,
    profileLoading,
    profileSaving,
    profileError,
    isAdmin,
    updateSessionProfile,
  } = useAuth();

  const [profileForm, setProfileForm] = useState<Profile>(emptyProfile);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const isDirtyRef = useRef(false);

  const isSchoolLocked = useMemo(
    () => isSchoolOrGradeLocked(sessionProfile?.schoolId),
    [sessionProfile?.schoolId],
  );
  const isGradeLocked = useMemo(
    () => isSchoolOrGradeLocked(sessionProfile?.grade),
    [sessionProfile?.grade],
  );

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
    // Locked school/grade always win from the saved profile.
    setProfileForm(prev => ({
      fullName: prev.fullName || nextForm.fullName,
      contactNumber: prev.contactNumber || nextForm.contactNumber,
      track: prev.track ?? nextForm.track,
      photoUri: prev.photoUri ?? nextForm.photoUri,
      schoolId: isSchoolOrGradeLocked(nextForm.schoolId)
        ? nextForm.schoolId
        : prev.schoolId ?? nextForm.schoolId,
      grade: isSchoolOrGradeLocked(nextForm.grade)
        ? nextForm.grade
        : prev.grade ?? nextForm.grade,
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

  const setTrack = useCallback((track: CourseTrack) => {
    markDirty();
    setProfileForm(prev => ({
      ...prev,
      track,
      // Do not clear school/grade when switching tracks — once saved they are immutable.
    }));
    setErrors(prev => ({
      ...prev,
      track: undefined,
    }));
  }, [markDirty]);

  const setPhotoUri = useCallback((uri: string | null) => {
    markDirty();
    setProfileForm(prev => ({ ...prev, photoUri: uri }));
  }, [markDirty]);

  const setSchoolId = useCallback(
    (schoolId: string | null) => {
      if (isSchoolLocked) {
        return;
      }
      markDirty();
      setProfileForm(prev => ({ ...prev, schoolId }));
      setErrors(prev => ({ ...prev, schoolId: undefined }));
    },
    [isSchoolLocked, markDirty],
  );

  const setGrade = useCallback(
    (grade: string | null) => {
      if (isGradeLocked) {
        return;
      }
      markDirty();
      setProfileForm(prev => ({ ...prev, grade }));
      setErrors(prev => ({ ...prev, grade: undefined }));
    },
    [isGradeLocked, markDirty],
  );

  const validate = useCallback((): boolean => {
    const nextErrors = validateProfileForm(
      {
        fullName: profileForm.fullName,
        contactNumber: profileForm.contactNumber,
        track: profileForm.track,
        schoolId: profileForm.schoolId,
        grade: profileForm.grade,
      },
      { requireTrack: !isAdmin },
    );
    setErrors(nextErrors);
    return !hasProfileFormErrors(nextErrors);
  }, [
    isAdmin,
    profileForm.contactNumber,
    profileForm.fullName,
    profileForm.track,
    profileForm.schoolId,
    profileForm.grade,
  ]);

  const persistProfile = useCallback(async (): Promise<boolean> => {
    const isKidsTrack = profileForm.track === 'kids';

    const success = await updateSessionProfile({
      fullName: profileForm.fullName,
      phoneNumber: profileForm.contactNumber,
      track: profileForm.track,
      photoUri: profileForm.photoUri,
      schoolId: resolveWritableSchoolId(
        sessionProfile?.schoolId,
        isKidsTrack ? profileForm.schoolId : null,
      ),
      grade: resolveWritableGrade(
        sessionProfile?.grade,
        isKidsTrack ? profileForm.grade : null,
      ),
    });

    if (success) {
      isDirtyRef.current = false;
    }

    return success;
  }, [
    profileForm,
    sessionProfile?.grade,
    sessionProfile?.schoolId,
    updateSessionProfile,
  ]);

  return {
    profile: profileForm,
    errors,
    isLoading: profileLoading,
    isSaving: profileSaving,
    saveError: profileError,
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
  };
}

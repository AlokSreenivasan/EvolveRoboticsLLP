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
import { isUnder13 } from '../../domain/Profile/validation/ageGate';
import { userProfileToFormProfile } from '../../utils/profile/mapUserProfile';
import {
  isBirthYearLocked,
  resolveWritableBirthYear,
} from '../../utils/profile/birthYearLock';
import {
  birthYearFromDateOfBirth,
  isDateOfBirthLocked,
  resolveWritableDateOfBirth,
} from '../../domain/Profile/validation/dateOfBirth';
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
    roleLoading,
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

  const isBirthYearLockedForUser = useMemo(
    () => isBirthYearLocked(sessionProfile?.birthYear),
    [sessionProfile?.birthYear],
  );
  const isDateOfBirthLockedForUser = useMemo(
    () => isDateOfBirthLocked(sessionProfile?.dateOfBirth),
    [sessionProfile?.dateOfBirth],
  );

  /** Admins and superadmins are not learners — skip Learning Track. */
  const requireLearningTrack = !roleLoading && !isAdmin;
  const requireAgeDeclaration = !roleLoading;

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
      birthYear: isBirthYearLocked(nextForm.birthYear)
        ? nextForm.birthYear
        : prev.birthYear ?? nextForm.birthYear,
      dateOfBirth: isDateOfBirthLocked(nextForm.dateOfBirth)
        ? nextForm.dateOfBirth
        : prev.dateOfBirth ?? nextForm.dateOfBirth,
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
      setProfileForm(prev => ({
        ...prev,
        schoolId,
        // Changing school invalidates a previously chosen grade.
        grade: isGradeLocked ? prev.grade : null,
      }));
      setErrors(prev => ({ ...prev, schoolId: undefined, grade: undefined }));
    },
    [isGradeLocked, isSchoolLocked, markDirty],
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

  const setDateOfBirth = useCallback(
    (dateOfBirth: string) => {
      if (isDateOfBirthLockedForUser) {
        return;
      }
      markDirty();
      const birthYear = birthYearFromDateOfBirth(dateOfBirth);
      setProfileForm(prev => ({
        ...prev,
        dateOfBirth,
        birthYear: birthYear ?? prev.birthYear,
      }));
      setErrors(prev => ({
        ...prev,
        dateOfBirth: undefined,
        birthYear: undefined,
      }));
    },
    [isDateOfBirthLockedForUser, markDirty],
  );

  const validate = useCallback(
    (options?: { validGradeValues?: string[] }): boolean => {
      const nextErrors = validateProfileForm(
        {
          fullName: profileForm.fullName,
          contactNumber: profileForm.contactNumber,
          track: profileForm.track,
          schoolId: profileForm.schoolId,
          grade: profileForm.grade,
          birthYear: profileForm.birthYear,
          dateOfBirth: profileForm.dateOfBirth,
        },
        {
          requireTrack: requireLearningTrack,
          requireAgeDeclaration,
          validGradeValues: options?.validGradeValues,
        },
      );
      setErrors(nextErrors);
      return !hasProfileFormErrors(nextErrors);
    },
    [
      requireLearningTrack,
      requireAgeDeclaration,
      profileForm.contactNumber,
      profileForm.fullName,
      profileForm.track,
      profileForm.schoolId,
      profileForm.grade,
      profileForm.birthYear,
      profileForm.dateOfBirth,
    ],
  );

  const persistProfile = useCallback(async (
    options?: { recordParentalConsent?: boolean },
  ): Promise<boolean> => {
    const isKidsTrack = profileForm.track === 'kids';
    const nextDateOfBirth = requireAgeDeclaration
      ? resolveWritableDateOfBirth(
          sessionProfile?.dateOfBirth,
          profileForm.dateOfBirth,
        )
      : sessionProfile?.dateOfBirth ?? null;
    const derivedBirthYear = birthYearFromDateOfBirth(nextDateOfBirth);
    const nextBirthYear = requireAgeDeclaration
      ? resolveWritableBirthYear(
          sessionProfile?.birthYear,
          derivedBirthYear ?? profileForm.birthYear,
          sessionProfile?.dateOfBirth,
        )
      : sessionProfile?.birthYear ?? null;
    const recordParentalConsent =
      options?.recordParentalConsent === true ||
      sessionProfile?.parentalConsentAtMs != null;
    const parentalConsentAtMs = isUnder13(nextBirthYear)
      ? sessionProfile?.parentalConsentAtMs ??
        (recordParentalConsent ? Date.now() : null)
      : sessionProfile?.parentalConsentAtMs ?? null;

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
      ...(requireAgeDeclaration
        ? {
            birthYear: nextBirthYear,
            dateOfBirth: nextDateOfBirth,
            parentalConsentAtMs,
          }
        : {}),
    });

    if (success) {
      isDirtyRef.current = false;
    }

    return success;
  }, [
    profileForm,
    requireAgeDeclaration,
    sessionProfile?.birthYear,
    sessionProfile?.dateOfBirth,
    sessionProfile?.grade,
    sessionProfile?.parentalConsentAtMs,
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
    isBirthYearLocked: isBirthYearLockedForUser,
    isDateOfBirthLocked: isDateOfBirthLockedForUser,
    requireLearningTrack,
    requireAgeDeclaration,
    hasParentalConsent: sessionProfile?.parentalConsentAtMs != null,
    roleLoading,
    setFullName,
    setContactNumber,
    setTrack,
    setPhotoUri,
    setSchoolId,
    setGrade,
    setDateOfBirth,
    validate,
    persistProfile,
  };
}

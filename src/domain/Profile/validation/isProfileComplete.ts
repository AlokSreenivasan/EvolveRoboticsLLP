import type { UserProfile } from '../../../store/user/types';

import { hasProfileFormErrors, validateProfileForm } from './validateProfileForm';

/** True when all required profile fields are filled (photo is optional). */
export function isProfileComplete(profile: UserProfile | null | undefined): boolean {
  if (!profile) {
    return false;
  }

  const errors = validateProfileForm({
    fullName: profile.fullName,
    contactNumber: profile.phoneNumber,
    schoolId: profile.schoolId,
    grade: profile.grade,
  });

  return !hasProfileFormErrors(errors);
}

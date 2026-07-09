import type { UserProfile } from '../../../store/user/types';
import { isAdminRole } from '../../../utils/role/normalizeUserRole';

import { hasProfileFormErrors, validateProfileForm } from './validateProfileForm';

/** True when all required profile fields are filled (photo is optional). */
export function isProfileComplete(profile: UserProfile | null | undefined): boolean {
  if (!profile) {
    return false;
  }

  const errors = validateProfileForm(
    {
      fullName: profile.fullName,
      contactNumber: profile.phoneNumber,
      track: profile.track,
      schoolId: profile.schoolId,
      grade: profile.grade,
    },
    { requireTrack: !isAdminRole(profile.role) },
  );

  return !hasProfileFormErrors(errors);
}

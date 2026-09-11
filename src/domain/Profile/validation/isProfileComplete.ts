import type { UserProfile } from '../../../store/user/types';
import { isAdminRole } from '../../../utils/role/normalizeUserRole';

import { needsParentalConsent } from './ageGate';
import { hasProfileFormErrors, validateProfileForm } from './validateProfileForm';

/** True when all required profile fields are filled (photo is optional). */
export function isProfileComplete(profile: UserProfile | null | undefined): boolean {
  if (!profile) {
    return false;
  }

  const isAdmin = isAdminRole(profile.role);
  const errors = validateProfileForm(
    {
      fullName: profile.fullName,
      contactNumber: profile.phoneNumber,
      track: profile.track,
      schoolId: profile.schoolId,
      grade: profile.grade,
      birthYear: profile.birthYear,
    },
    {
      requireTrack: !isAdmin,
      requireAgeDeclaration: !isAdmin,
    },
  );

  if (hasProfileFormErrors(errors)) {
    return false;
  }

  if (isAdmin) {
    return true;
  }

  return !needsParentalConsent(profile.birthYear, profile.parentalConsentAtMs);
}

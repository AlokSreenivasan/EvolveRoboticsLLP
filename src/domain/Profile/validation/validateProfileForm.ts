import { isCourseTrack } from '../../../store/content/types/courses.types';
import { isValidBirthYear } from './ageGate';
import { isValidContactNumber } from './isValidContactNumber';

export type ProfileFormErrors = {
  fullName?: string;
  contactNumber?: string;
  track?: string;
  schoolId?: string;
  grade?: string;
  birthYear?: string;
};

export type ProfileFormInput = {
  fullName: string;
  contactNumber: string;
  track: string | null;
  schoolId: string | null;
  grade: string | null;
  birthYear?: number | null;
};

export type ProfileFormValidationOptions = {
  requireTrack?: boolean;
  requireAgeDeclaration?: boolean;
  /**
   * When provided (e.g. grades for the selected school), grade must be one of
   * these values. When omitted, any non-empty grade is accepted so custom
   * school grade ids still count as a complete profile.
   */
  validGradeValues?: string[];
};

export function validateProfileForm(
  input: ProfileFormInput,
  options: ProfileFormValidationOptions = {},
): ProfileFormErrors {
  const {
    requireTrack = true,
    requireAgeDeclaration = true,
    validGradeValues,
  } = options;
  const errors: ProfileFormErrors = {};

  if (!input.fullName.trim()) {
    errors.fullName = 'Full name is required';
  }

  if (!input.contactNumber.trim()) {
    errors.contactNumber = 'Contact number is required';
  } else if (!isValidContactNumber(input.contactNumber)) {
    errors.contactNumber = 'Contact number must be exactly 10 digits';
  }

  if (requireTrack) {
    if (!input.track) {
      errors.track = 'Please select Kids or Professional';
    } else if (!isCourseTrack(input.track)) {
      errors.track = 'Please select a valid option';
    }
  }

  if (requireAgeDeclaration && !isValidBirthYear(input.birthYear)) {
    errors.birthYear = 'Please select your birth year';
  }

  if (input.track === 'kids') {
    if (!input.schoolId?.trim()) {
      errors.schoolId = 'Please select your school';
    }

    if (!input.grade?.trim()) {
      errors.grade = 'Please select your grade';
    } else if (
      validGradeValues &&
      !validGradeValues.includes(input.grade)
    ) {
      errors.grade = 'Please select a valid grade';
    }
  }

  return errors;
}

export function hasProfileFormErrors(errors: ProfileFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

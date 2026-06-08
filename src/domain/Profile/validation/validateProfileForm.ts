import { GRADE_OPTIONS } from '../../../constants/gradeOptions';
import { isValidContactNumber } from './isValidContactNumber';

export type ProfileFormErrors = {
  fullName?: string;
  contactNumber?: string;
  schoolId?: string;
  grade?: string;
};

export type ProfileFormInput = {
  fullName: string;
  contactNumber: string;
  schoolId: string | null;
  grade: string | null;
};

export function validateProfileForm(
  input: ProfileFormInput,
): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  if (!input.fullName.trim()) {
    errors.fullName = 'Full name is required';
  }

  if (!input.contactNumber.trim()) {
    errors.contactNumber = 'Contact number is required';
  } else if (!isValidContactNumber(input.contactNumber)) {
    errors.contactNumber = 'Contact number must be exactly 10 digits';
  }

  if (!input.schoolId?.trim()) {
    errors.schoolId = 'Please select your school';
  }

  if (!input.grade?.trim()) {
    errors.grade = 'Please select your grade';
  } else if (!GRADE_OPTIONS.some(option => option.value === input.grade)) {
    errors.grade = 'Please select a valid grade';
  }

  return errors;
}

export function hasProfileFormErrors(errors: ProfileFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

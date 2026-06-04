import { isValidContactNumber } from './isValidContactNumber';

export type ProfileFormErrors = {
  fullName?: string;
  contactNumber?: string;
  schoolId?: string;
};

export type ProfileFormInput = {
  fullName: string;
  contactNumber: string;
  schoolId: string | null;
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

  return errors;
}

export function hasProfileFormErrors(errors: ProfileFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

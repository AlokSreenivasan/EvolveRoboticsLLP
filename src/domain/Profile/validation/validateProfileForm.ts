import { isValidContactNumber } from './isValidContactNumber';

export type ProfileFormErrors = {
  fullName?: string;
  contactNumber?: string;
};

export type ProfileFormInput = {
  fullName: string;
  contactNumber: string;
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
    errors.contactNumber = 'Enter a valid contact number (10–15 digits)';
  }

  return errors;
}

export function hasProfileFormErrors(errors: ProfileFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

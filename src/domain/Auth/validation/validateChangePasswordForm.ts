import { isValidPassword } from './isValidPassword';

export type ChangePasswordFormErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
};

export type ChangePasswordFormInput = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export function validateChangePasswordForm(
  input: ChangePasswordFormInput,
): ChangePasswordFormErrors {
  const errors: ChangePasswordFormErrors = {};

  if (!input.currentPassword.trim()) {
    errors.currentPassword = 'Current password is required';
  }

  if (!input.newPassword.trim()) {
    errors.newPassword = 'New password is required';
  } else if (!isValidPassword(input.newPassword)) {
    errors.newPassword = 'Minimum 8 characters';
  }

  if (!input.confirmNewPassword.trim()) {
    errors.confirmNewPassword = 'Please confirm your new password';
  } else if (input.confirmNewPassword !== input.newPassword) {
    errors.confirmNewPassword = 'Passwords do not match';
  }

  return errors;
}

export function hasChangePasswordFormErrors(
  errors: ChangePasswordFormErrors,
): boolean {
  return Object.keys(errors).length > 0;
}

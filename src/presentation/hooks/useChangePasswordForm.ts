import { useCallback, useState } from 'react';

import {
  ChangePasswordFormErrors,
  hasChangePasswordFormErrors,
  validateChangePasswordForm,
} from '../../domain/Auth/validation/validateChangePasswordForm';
import { changePassword } from '../../services/firebase/changePasswordService';

export function useChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errors, setErrors] = useState<ChangePasswordFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFieldError = useCallback(
    (field: keyof ChangePasswordFormErrors) => {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleCurrentPasswordChange = useCallback(
    (value: string) => {
      setCurrentPassword(value);
      clearFieldError('currentPassword');
    },
    [clearFieldError],
  );

  const handleNewPasswordChange = useCallback(
    (value: string) => {
      setNewPassword(value);
      clearFieldError('newPassword');
    },
    [clearFieldError],
  );

  const handleConfirmNewPasswordChange = useCallback(
    (value: string) => {
      setConfirmNewPassword(value);
      clearFieldError('confirmNewPassword');
    },
    [clearFieldError],
  );

  const validate = useCallback((): boolean => {
    const nextErrors = validateChangePasswordForm({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
    setErrors(nextErrors);
    return !hasChangePasswordFormErrors(nextErrors);
  }, [confirmNewPassword, currentPassword, newPassword]);

  const submitPasswordChange = useCallback(async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    if (!validate()) {
      return { success: false };
    }

    setIsSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Could not update password. Please try again.',
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [currentPassword, newPassword, validate]);

  return {
    currentPassword,
    newPassword,
    confirmNewPassword,
    errors,
    isSubmitting,
    setCurrentPassword: handleCurrentPasswordChange,
    setNewPassword: handleNewPasswordChange,
    setConfirmNewPassword: handleConfirmNewPasswordChange,
    validate,
    submitPasswordChange,
  };
}

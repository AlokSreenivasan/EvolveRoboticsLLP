/** Matches sign-up minimum length (8 characters). */
export const PASSWORD_MIN_LENGTH = 8;

/** Human-readable password complexity rules for alerts and UI. */
export const PASSWORD_REQUIREMENTS_MESSAGE =
  'Password must be at least 8 characters and include at least one lowercase letter, one uppercase letter, one number, and one symbol.';

/**
 * Requires 8+ characters with lowercase, uppercase, number, and symbol.
 */
export function isValidPassword(password: string): boolean {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return false;
  }

  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  return hasLowercase && hasUppercase && hasNumber && hasSymbol;
}

/** Matches sign-up minimum length (8 characters). */
export const PASSWORD_MIN_LENGTH = 8;

export function isValidPassword(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH;
}

const PASSWORD_PROVIDER_ID = 'password';
const GOOGLE_PROVIDER_ID = 'google.com';

export type EmailVerificationUser = {
  emailVerified?: boolean;
  providerData?: Array<{ providerId?: string | null } | null> | null;
} | null;

function hasProvider(
  user: NonNullable<EmailVerificationUser>,
  providerId: string,
): boolean {
  return (
    user.providerData?.some(provider => provider?.providerId === providerId) ??
    false
  );
}

/**
 * Email/password accounts must confirm the inbox. Google-only sessions skip this.
 * Empty providerData on a new email account is treated as password sign-up.
 */
export function requiresEmailVerification(
  user: EmailVerificationUser,
): boolean {
  if (!user) {
    return false;
  }

  const hasPassword = hasProvider(user, PASSWORD_PROVIDER_ID);
  const hasGoogle = hasProvider(user, GOOGLE_PROVIDER_ID);

  if (hasGoogle && !hasPassword) {
    return false;
  }

  if (!user.emailVerified && (hasPassword || !hasGoogle)) {
    return true;
  }

  return false;
}

import { getErrorMessage } from '../firebase/errors';

function isPermissionDenied(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  if (typeof code === 'string' && code.includes('permission-denied')) {
    return true;
  }
  const message = (error as { message?: string } | null)?.message;
  return typeof message === 'string' && message.toLowerCase().includes('permission');
}

export function toAdminWriteErrorMessage(error: unknown): string {
  const base = getErrorMessage(error);
  if (!isPermissionDenied(error)) {
    return base;
  }
  const code = (error as { code?: string } | null)?.code;
  const service = code?.includes('storage') ? 'Storage' : 'Firestore';
  return `${base}\n\nFix checklist:\n1) Your Firestore users/{your-uid}.role must be exactly "superadmin" (not "admin")\n2) Deploy rules: cd Evolve && firebase deploy --only firestore:rules\n3) Sign out and sign back in after changing your role\n4) ${service} permission denied`;
}

export function toRoleWriteErrorMessage(
  error: unknown,
  uid?: string | null,
): string {
  const base = getErrorMessage(error);
  if (!isPermissionDenied(error)) {
    return base;
  }
  const uidHint = uid
    ? `\n\nYour UID: ${uid}\nSet users/${uid}.role to "superadmin" in Firebase Console.`
    : '';
  return `${base}\n\nOnly superadmins can change roles.${uidHint}\n\nThen deploy rules:\ncd Evolve && firebase deploy --only firestore:rules\n\nSign out and back in after updating your role.`;
}

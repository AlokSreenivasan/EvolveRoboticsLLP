import { FirebaseServiceError, getErrorMessage } from '../firebase/errors';
import {
  extractFirebaseErrorDetails,
  normalizeFirebaseErrorCode,
} from '../firebase/extractFirebaseError';

function isPermissionDenied(error: unknown): boolean {
  const details = extractFirebaseErrorDetails(error);
  const normalized = normalizeFirebaseErrorCode(details.code);
  if (
    normalized === 'permission-denied' ||
    normalized === 'unauthorized'
  ) {
    return true;
  }

  if (error instanceof FirebaseServiceError) {
    const causeDetails = extractFirebaseErrorDetails(error.cause);
    const causeNormalized = normalizeFirebaseErrorCode(causeDetails.code);
    if (
      causeNormalized === 'permission-denied' ||
      causeNormalized === 'unauthorized'
    ) {
      return true;
    }
  }

  const message = details.message ?? (error as { message?: string } | null)?.message;
  return typeof message === 'string' && message.toLowerCase().includes('permission');
}

function resolveDeniedService(error: unknown): 'Storage' | 'Firestore' {
  const details = extractFirebaseErrorDetails(error);
  const code = details.code ?? '';
  if (code.includes('storage') || code.startsWith('storage/')) {
    return 'Storage';
  }

  if (error instanceof FirebaseServiceError) {
    if (error.code === 'UPLOAD_FAILED' || error.code === 'STORAGE_ERROR') {
      return 'Storage';
    }
    const causeCode = extractFirebaseErrorDetails(error.cause).code ?? '';
    if (causeCode.includes('storage')) {
      return 'Storage';
    }
  }

  return 'Firestore';
}

export function toAdminWriteErrorMessage(error: unknown): string {
  const base = getErrorMessage(error);
  if (!isPermissionDenied(error)) {
    return base;
  }
  const service = resolveDeniedService(error);
  const deployTarget =
    service === 'Storage'
      ? 'firebase deploy --only storage,firestore:rules'
      : 'firebase deploy --only firestore:rules,storage';
  return (
    `${base}\n\nFix checklist:\n` +
    '1) users/{your-uid}.role must be "superadmin" for Lessons, Courses, Projects, and similar CMS screens ("admin" is enough only for Resources, Assignments, Exams, Quiz)\n' +
    `2) Deploy rules: cd Evolve && ${deployTarget}\n` +
    '3) Sign out and sign back in after changing your role\n' +
    `4) ${service} permission denied`
  );
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

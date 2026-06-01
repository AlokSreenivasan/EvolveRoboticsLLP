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
  return `${base}\n\nFix checklist:\n1) Firestore users/{uid}.role must be exactly \"admin\"\n2) Deploy rules: cd Evolve && firebase deploy --only firestore:rules,storage\n3) ${service} permission denied`;
}

import { FirebaseServiceError } from './errors';
import { getCurrentUserId } from '../../services/firebase/authService';

export function assertAuthenticatedUserId(): string {
  const uid = getCurrentUserId();
  if (!uid) {
    throw new FirebaseServiceError(
      'NOT_AUTHENTICATED',
      'You must be signed in to perform this action.',
    );
  }
  return uid;
}

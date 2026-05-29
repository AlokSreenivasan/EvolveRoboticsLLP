import { getAuth, getIdToken, reload } from '@react-native-firebase/auth';
import { Platform } from 'react-native';

import {
  db,
  enableNetwork,
  waitForPendingWrites,
} from '../../services/firebase/firestoreClient';
import { logFirebaseOperationError } from './extractFirebaseError';

const firebaseAuth = getAuth();

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Ensures Firestore uses a fresh Firebase Auth ID token before sensitive writes.
 * iOS often sends delete requests without an updated token after re-authentication.
 */
export async function syncFirestoreAuthSession(): Promise<string> {
  const user = firebaseAuth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to continue.');
  }

  await reload(user);
  await getIdToken(user, true);
  await enableNetwork(db);

  if (Platform.OS === 'ios') {
    try {
      await waitForPendingWrites(db);
    } catch (error) {
      logFirebaseOperationError(
        'syncFirestoreAuthSession',
        'waitForPendingWrites',
        error,
      );
    }
    // Native Firestore on iOS can lag behind Auth token refresh without a short yield.
    await delay(200);
  }

  if (__DEV__) {
    console.log('[syncFirestoreAuthSession] ready', { uid: user.uid });
  }

  return user.uid;
}

export function assertAuthUidMatches(targetUid: string): void {
  const authUid = firebaseAuth.currentUser?.uid;
  if (!authUid) {
    throw new Error('You must be signed in to continue.');
  }
  if (authUid !== targetUid) {
    throw new Error(
      'Session mismatch detected. Sign out, sign in again, then retry account deletion.',
    );
  }
}

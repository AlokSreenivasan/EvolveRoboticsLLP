import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Platform } from 'react-native';

import { logFirebaseOperationError } from './extractFirebaseError';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Ensures Firestore uses a fresh Firebase Auth ID token before sensitive writes.
 * iOS often sends delete requests without an updated token after re-authentication.
 */
export async function syncFirestoreAuthSession(): Promise<string> {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('You must be signed in to continue.');
  }

  await user.reload();
  await user.getIdToken(true);
  await firestore().enableNetwork();

  if (Platform.OS === 'ios') {
    try {
      await firestore().waitForPendingWrites();
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
  const authUid = auth().currentUser?.uid;
  if (!authUid) {
    throw new Error('You must be signed in to continue.');
  }
  if (authUid !== targetUid) {
    throw new Error(
      'Session mismatch detected. Sign out, sign in again, then retry account deletion.',
    );
  }
}

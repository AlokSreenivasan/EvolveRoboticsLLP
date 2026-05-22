import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

/**
 * Thin auth helpers for profile services.
 * Login/sign-up screens continue to use Firebase Auth directly.
 */
export function getAuthInstance() {
  return auth();
}

export function getCurrentUser(): FirebaseAuthTypes.User | null {
  return auth().currentUser;
}

export function getCurrentUserId(): string | null {
  return auth().currentUser?.uid ?? null;
}

export function getCurrentUserEmail(): string | null {
  return auth().currentUser?.email ?? null;
}

export function onAuthStateChanged(
  listener: (user: FirebaseAuthTypes.User | null) => void,
): () => void {
  return auth().onAuthStateChanged(listener);
}

export async function signOut(): Promise<void> {
  await auth().signOut();
}

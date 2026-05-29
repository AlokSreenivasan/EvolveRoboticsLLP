import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  GoogleSignin,
  isCancelledResponse,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { GOOGLE_WEB_CLIENT_ID } from '../../config/googleSignIn';

let configured = false;
let signInInProgress = false;

export function configureGoogleSignIn(): void {
  if (configured) {
    return;
  }

  if (!GOOGLE_WEB_CLIENT_ID.trim()) {
    if (__DEV__) {
      console.warn(
        'Google Sign-In is not configured. Set GOOGLE_WEB_CLIENT_ID in src/config/googleSignIn.ts',
      );
    }
    return;
  }

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID.trim(),
  });

  configured = true;
}

function ensureConfigured(): void {
  if (!configured) {
    configureGoogleSignIn();
  }

  if (!configured) {
    throw new Error(
      'Google Sign-In is not configured. Set GOOGLE_WEB_CLIENT_ID in src/config/googleSignIn.ts',
    );
  }
}

export function isGoogleAccountProvider(
  user: FirebaseAuthTypes.User | null | undefined,
): boolean {
  return (
    user?.providerData.some(provider => provider.providerId === 'google.com') ??
    false
  );
}

/**
 * Clears the native Google Sign-In session without touching Firebase Auth.
 * Call after Firebase sign-out when the user signed in with Google.
 */
export async function signOutGoogleSdk(): Promise<void> {
  try {
    configureGoogleSignIn();
    if (GoogleSignin.hasPreviousSignIn()) {
      await GoogleSignin.signOut();
    }
  } catch {
    // Non-fatal: Firebase session is already cleared.
  }
}

export async function signInWithGoogle(): Promise<void> {
  if (signInInProgress) {
    return;
  }

  ensureConfigured();
  signInInProgress = true;

  try {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    const response = await GoogleSignin.signIn();

    if (isCancelledResponse(response)) {
      throw Object.assign(new Error('Google Sign-In was cancelled.'), {
        code: statusCodes.SIGN_IN_CANCELLED,
      });
    }

    if (!isSuccessResponse(response)) {
      throw new Error('Google Sign-In failed.');
    }

    let idToken = response.data.idToken;
    if (!idToken) {
      const tokens = await GoogleSignin.getTokens();
      idToken = tokens.idToken;
    }

    if (!idToken) {
      throw new Error('Google Sign-In failed. Missing idToken.');
    }

    const credential = auth.GoogleAuthProvider.credential(idToken);
    await auth().signInWithCredential(credential);
  } finally {
    signInInProgress = false;
  }
}

/** Signs out of Firebase and the Google SDK (use {@link signOut} from authService instead). */
export async function signOutFromGoogle(): Promise<void> {
  await auth().signOut();
  await signOutGoogleSdk();
}

export function isGoogleSignInCancelled(error: unknown): boolean {
  const maybe = error as { code?: string };
  return maybe?.code === statusCodes.SIGN_IN_CANCELLED;
}

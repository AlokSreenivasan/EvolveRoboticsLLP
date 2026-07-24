import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as signOutFirebase,
} from '@react-native-firebase/auth';
import {
  GoogleSignin,
  isCancelledResponse,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { GOOGLE_WEB_CLIENT_ID } from '../../config/googleSignIn';
import { createUserProfileIfNotExists } from '../firebase/userService';

const firebaseAuth = getAuth();

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

    const credential = GoogleAuthProvider.credential(idToken);
    const { user } = await signInWithCredential(firebaseAuth, credential);

    // Ensure users/{uid} exists for first-time Google sign-in (email signup already does this).
    // Non-fatal: Auth session is already established; AuthContext can hydrate a fallback.
    try {
      await createUserProfileIfNotExists(user.uid, {
        fullName: user.displayName?.trim() || user.email?.split('@')[0] || 'User',
        email: user.email?.trim() || '',
        phoneNumber: user.phoneNumber?.trim() || '',
        profileImage: user.photoURL?.trim() || null,
      });
    } catch (profileError) {
      if (__DEV__) {
        console.warn(
          'Google Sign-In: could not create Firestore profile',
          profileError,
        );
      }
    }
  } finally {
    signInInProgress = false;
  }
}

/** Signs out of Firebase and the Google SDK (use {@link signOut} from authService instead). */
export async function signOutFromGoogle(): Promise<void> {
  await signOutFirebase(firebaseAuth);
  await signOutGoogleSdk();
}

export function isGoogleSignInCancelled(error: unknown): boolean {
  const maybe = error as { code?: string };
  return maybe?.code === statusCodes.SIGN_IN_CANCELLED;
}

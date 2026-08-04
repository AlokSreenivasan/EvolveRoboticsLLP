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

import {
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from '../../config/googleSignIn';
import type { UserProfile } from '../../store/user/types';
import { DEFAULT_USER_ROLE } from '../../store/user/types/role.types';
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

  const iosClientId = GOOGLE_IOS_CLIENT_ID.trim();
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID.trim(),
    ...(iosClientId ? { iosClientId } : {}),
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

function buildAuthDerivedProfile(user: FirebaseAuthTypes.User): UserProfile {
  return {
    uid: user.uid,
    fullName:
      user.displayName?.trim() || user.email?.split('@')[0] || 'User',
    email: user.email?.trim() || '',
    phoneNumber: user.phoneNumber?.trim() || '',
    profileImage: user.photoURL?.trim() || null,
    schoolId: null,
    grade: null,
    track: null,
    role: DEFAULT_USER_ROLE,
    createdAt: null,
    updatedAt: null,
  };
}

/**
 * Completes Google Sign-In and ensures a Firestore users/{uid} document exists.
 * Returns the profile so callers can seed AuthContext before navigation.
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  if (signInInProgress) {
    throw Object.assign(new Error('Google Sign-In is already in progress.'), {
      code: statusCodes.IN_PROGRESS,
    });
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
    const authDerived = buildAuthDerivedProfile(user);

    // Ensure users/{uid} exists for first-time Google sign-in (email signup already does this).
    // Always return a profile the UI can show — never leave Profile completion empty.
    try {
      return await createUserProfileIfNotExists(user.uid, {
        fullName: authDerived.fullName,
        email: authDerived.email,
        phoneNumber: authDerived.phoneNumber,
        profileImage: authDerived.profileImage,
      });
    } catch (profileError) {
      if (__DEV__) {
        console.warn(
          'Google Sign-In: could not create Firestore profile',
          profileError,
        );
      }
      return authDerived;
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

/**
 * Maps native Google Sign-In / Firebase Auth errors to user-facing messages.
 */
export function getGoogleSignInErrorMessage(error: unknown): string {
  const maybe = error as { code?: string | number; message?: string };
  const code = String(maybe?.code ?? '');
  const message = maybe?.message ?? '';

  if (__DEV__) {
    console.warn(`Google Sign-In error [code=${code || 'none'}]: ${message}`);
  }

  if (code === statusCodes.SIGN_IN_CANCELLED) {
    return 'Google Sign-In was cancelled.';
  }
  if (code === statusCodes.IN_PROGRESS) {
    return 'Google Sign-In is already in progress.';
  }
  if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return 'Google Play Services is required for Google Sign-In on this device.';
  }
  // Android DEVELOPER_ERROR (ApiException: 10). Play Services returns this both for a
  // genuine OAuth/SHA-1 mismatch and as a catch-all when it cannot complete sign-in at
  // all (e.g. no Google account on the device, or outdated Play Services), so the copy
  // must not assert a specific cause.
  if (
    code === '10' ||
    code === 'DEVELOPER_ERROR' ||
    /ApiException:\s*10\b/i.test(message) ||
    /DEVELOPER_ERROR/i.test(message)
  ) {
    return (
      'Google Sign-In could not be completed on this device. ' +
      'Make sure a Google account is added to the device and Google Play Services is up to date. ' +
      'If this persists on every device, the build may be signed with a certificate ' +
      'that is not registered in Firebase.'
    );
  }
  if (code.startsWith('auth/')) {
    switch (code) {
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email using a different sign-in method.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      case 'auth/operation-not-allowed':
        return 'Google sign-in is not enabled in Firebase Authentication.';
      default:
        return message || 'Google Sign-In failed. Please try again.';
    }
  }

  return message || 'Google Sign-In failed. Please try again.';
}

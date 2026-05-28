import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { GOOGLE_WEB_CLIENT_ID } from '../../config/googleSignIn';

let configured = false;

function ensureConfigured() {
  if (configured) {
    return;
  }

  if (!GOOGLE_WEB_CLIENT_ID.trim()) {
    throw new Error(
      'Google Sign-In is not configured. Set GOOGLE_WEB_CLIENT_ID in src/config/googleSignIn.ts',
    );
  }

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID.trim(),
  });

  configured = true;
}

export async function signInWithGoogle(): Promise<void> {
  ensureConfigured();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const { idToken } = await GoogleSignin.signIn();
  if (!idToken) {
    throw new Error('Google Sign-In failed. Missing idToken.');
  }

  const credential = auth.GoogleAuthProvider.credential(idToken);
  await auth().signInWithCredential(credential);
}

export async function signOutFromGoogle(): Promise<void> {
  ensureConfigured();
  await auth().signOut();
  await GoogleSignin.signOut();
}

export function isGoogleSignInCancelled(error: unknown): boolean {
  const maybe = error as { code?: string };
  return maybe?.code === statusCodes.SIGN_IN_CANCELLED;
}


import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

import { wrapFirebaseError } from '../../utils/firebase/errors';
import { FIRESTORE_COLLECTIONS } from './constants';
import { db, doc, serverTimestamp, setDoc } from './firestoreClient';

const FCM_TOKENS_SUBCOLLECTION = 'fcmTokens';

function tokenDocId(token: string): string {
  return token.replace(/\//g, '_');
}

function pushPlatform(): 'ios' | 'android' {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

async function requestPushPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const status = await messaging().requestPermission();
    return (
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  return true;
}

async function persistFcmToken(uid: string, token: string): Promise<void> {
  const ref = doc(
    db,
    FIRESTORE_COLLECTIONS.users,
    uid,
    FCM_TOKENS_SUBCOLLECTION,
    tokenDocId(token),
  );

  await setDoc(
    ref,
    {
      token,
      platform: pushPlatform(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * Requests notification permission, registers the device FCM token, and
 * keeps it updated in users/{uid}/fcmTokens.
 */
export async function registerDeviceForPushNotifications(
  uid: string,
): Promise<void> {
  try {
    const permitted = await requestPushPermission();
    if (!permitted) {
      return;
    }

    const token = await messaging().getToken();
    if (!token) {
      return;
    }

    await persistFcmToken(uid, token);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'PUSH_REGISTRATION_ERROR',
      'Failed to register for push notifications.',
    );
  }
}

export function subscribeFcmTokenRefresh(uid: string): () => void {
  return messaging().onTokenRefresh(async token => {
    try {
      if (token) {
        await persistFcmToken(uid, token);
      }
    } catch {
      // Non-fatal; next app open will retry registration.
    }
  });
}

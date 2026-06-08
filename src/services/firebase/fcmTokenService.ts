import {
  AuthorizationStatus,
  deleteToken,
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

import { loadNotificationPreferences } from '../notificationPreferencesStorage';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { FIRESTORE_COLLECTIONS } from './constants';
import {
  collection,
  db,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from './firestoreClient';

const firebaseMessaging = getMessaging();

const FCM_TOKENS_SUBCOLLECTION = 'fcmTokens';

function tokenDocId(token: string): string {
  return token.replace(/\//g, '_');
}

function pushPlatform(): 'ios' | 'android' {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

async function requestPushPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const status = await requestPermission(firebaseMessaging);
    return (
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL
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

    const token = await getToken(firebaseMessaging);
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

async function deleteStoredFcmTokens(uid: string): Promise<void> {
  const tokensRef = collection(
    db,
    FIRESTORE_COLLECTIONS.users,
    uid,
    FCM_TOKENS_SUBCOLLECTION,
  );
  const snapshot = await getDocs(tokensRef);
  await Promise.all(snapshot.docs.map(tokenDoc => deleteDoc(tokenDoc.ref)));
}

/**
 * Deletes the device FCM token and removes all stored tokens for the user.
 */
export async function unregisterDeviceForPushNotifications(
  uid: string,
): Promise<void> {
  try {
    try {
      await deleteToken(firebaseMessaging);
    } catch {
      // No token on device — still clear Firestore records.
    }

    await deleteStoredFcmTokens(uid);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'PUSH_UNREGISTRATION_ERROR',
      'Failed to unregister from push notifications.',
    );
  }
}

export function subscribeFcmTokenRefresh(uid: string): () => void {
  return onTokenRefresh(firebaseMessaging, async token => {
    try {
      const preferences = await loadNotificationPreferences();
      if (!preferences.pushNotifications || !token) {
        return;
      }

      await persistFcmToken(uid, token);
    } catch {
      // Non-fatal; next app open will retry registration.
    }
  });
}

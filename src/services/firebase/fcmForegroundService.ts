import {
  getMessaging,
  onMessage,
  type FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';

import { loadNotificationPreferences } from '../notificationPreferencesStorage';
import { appAlert } from '../../utils/alert/appAlert';

const firebaseMessaging = getMessaging();

function resolveNotificationCopy(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): { title: string; body: string } | null {
  const title =
    remoteMessage.notification?.title?.trim() ||
    (typeof remoteMessage.data?.title === 'string'
      ? remoteMessage.data.title.trim()
      : '');
  const body =
    remoteMessage.notification?.body?.trim() ||
    (typeof remoteMessage.data?.body === 'string'
      ? remoteMessage.data.body.trim()
      : '');

  if (!title && !body) {
    return null;
  }

  return {
    title: title || 'Evolve',
    body: body || '',
  };
}

/**
 * Shows an in-app alert while the app is in the foreground.
 * Background/killed delivery is handled by the OS from the FCM notification payload.
 */
export async function displayForegroundPushNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  const copy = resolveNotificationCopy(remoteMessage);
  if (!copy) {
    return;
  }

  const preferences = await loadNotificationPreferences();
  if (!preferences.pushNotifications) {
    return;
  }

  const messageType =
    typeof remoteMessage.data?.type === 'string'
      ? remoteMessage.data.type
      : '';
  if (
    messageType === 'class_forum_message' &&
    preferences.classForumMessages === false
  ) {
    return;
  }

  appAlert(copy.title, copy.body || undefined);
}

/**
 * Subscribes to FCM messages delivered while the app is open and displays them.
 */
export function subscribeForegroundPushDisplay(): () => void {
  return onMessage(firebaseMessaging, async remoteMessage => {
    try {
      await displayForegroundPushNotification(remoteMessage);
    } catch {
      // Non-fatal; user may still see the in-app notifications feed.
    }
  });
}

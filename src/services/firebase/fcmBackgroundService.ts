import {
  getMessaging,
  setBackgroundMessageHandler,
  type FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';

const firebaseMessaging = getMessaging();

/**
 * Acknowledges FCM messages delivered while the app is backgrounded or killed.
 * Must be registered as early as possible (from index.js) so Android can find
 * the ReactNativeFirebaseMessagingHeadlessTask.
 *
 * Notification UI is shown by the OS from the FCM notification payload.
 */
export async function handleBackgroundPushMessage(
  _remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  // No-op: notification display is OS-handled; keep the headless task registered.
}

/**
 * Registers the Android headless background message handler.
 * Call once from the app entry point before AppRegistry.registerComponent.
 */
export function registerBackgroundPushHandler(): void {
  setBackgroundMessageHandler(firebaseMessaging, handleBackgroundPushMessage);
}

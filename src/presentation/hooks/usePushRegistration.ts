import { useEffect } from 'react';

import {
  registerDeviceForPushNotifications,
  subscribeFcmTokenRefresh,
} from '../../services/firebase/fcmTokenService';
import { hydrateNotificationPreferences } from '../../services/notificationPreferencesStorage';
import { useAuth } from '../context/AuthContext';

/**
 * Registers the signed-in user's device for FCM when push is enabled.
 */
export function usePushRegistration() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    let unsubRefresh: (() => void) | undefined;
    let cancelled = false;

    hydrateNotificationPreferences(user.uid).then(preferences => {
      if (cancelled || !preferences.pushNotifications) {
        return;
      }

      registerDeviceForPushNotifications(user.uid).catch(() => undefined);
      unsubRefresh = subscribeFcmTokenRefresh(user.uid);
    });

    return () => {
      cancelled = true;
      unsubRefresh?.();
    };
  }, [user?.uid]);
}

import { useEffect } from 'react';

import {
  registerDeviceForPushNotifications,
  subscribeFcmTokenRefresh,
} from '../../services/firebase/fcmTokenService';
import { useAuth } from '../context/AuthContext';

/**
 * Registers the signed-in user's device for FCM when the session is active.
 */
export function usePushRegistration() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    let unsubRefresh: (() => void) | undefined;

    registerDeviceForPushNotifications(user.uid).catch(() => undefined);
    unsubRefresh = subscribeFcmTokenRefresh(user.uid);

    return () => {
      unsubRefresh?.();
    };
  }, [user?.uid]);
}

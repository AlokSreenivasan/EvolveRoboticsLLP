import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

import {
  displayForegroundPushNotification,
  subscribeForegroundPushDisplay,
} from '../fcmForegroundService';
import { appAlert } from '../../../utils/alert/appAlert';

jest.mock('../../notificationPreferencesStorage', () => ({
  loadNotificationPreferences: jest.fn(),
}));

jest.mock('../../../utils/alert/appAlert', () => ({
  appAlert: jest.fn(),
}));

const {
  loadNotificationPreferences,
} = require('../../notificationPreferencesStorage') as {
  loadNotificationPreferences: jest.Mock;
};

const messaging = require('@react-native-firebase/messaging');

describe('displayForegroundPushNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadNotificationPreferences.mockResolvedValue({
      pushNotifications: true,
      soundAndVibration: true,
      classForumMessages: true,
    });
  });

  it('shows an in-app alert from the FCM payload', async () => {
    const remoteMessage = {
      notification: { title: 'Workshop', body: 'Tomorrow at 10 AM' },
      data: { notificationId: 'n1', type: 'live_notification' },
    } as unknown as FirebaseMessagingTypes.RemoteMessage;

    await displayForegroundPushNotification(remoteMessage);

    expect(appAlert).toHaveBeenCalledWith('Workshop', 'Tomorrow at 10 AM');
  });

  it('skips display when push notifications are disabled', async () => {
    loadNotificationPreferences.mockResolvedValue({
      pushNotifications: false,
      soundAndVibration: false,
      classForumMessages: true,
    });
    await displayForegroundPushNotification({
      notification: { title: 'Skip', body: 'Me' },
      data: {},
    } as unknown as FirebaseMessagingTypes.RemoteMessage);

    expect(appAlert).not.toHaveBeenCalled();
  });

  it('skips class forum alerts when that preference is off', async () => {
    loadNotificationPreferences.mockResolvedValue({
      pushNotifications: true,
      soundAndVibration: true,
      classForumMessages: false,
    });

    await displayForegroundPushNotification({
      notification: { title: 'Forum', body: 'Ada: hello' },
      data: { type: 'class_forum_message' },
    } as unknown as FirebaseMessagingTypes.RemoteMessage);

    expect(appAlert).not.toHaveBeenCalled();
  });

  it('skips display when title and body are missing', async () => {
    await displayForegroundPushNotification({
      data: { type: 'live_notification' },
    } as unknown as FirebaseMessagingTypes.RemoteMessage);

    expect(appAlert).not.toHaveBeenCalled();
  });
});

describe('subscribeForegroundPushDisplay', () => {
  it('subscribes to onMessage and returns an unsubscribe', () => {
    const unsubscribe = jest.fn();
    messaging.onMessage.mockReturnValue(unsubscribe);

    const result = subscribeForegroundPushDisplay();

    expect(messaging.onMessage).toHaveBeenCalled();
    expect(result).toBe(unsubscribe);
  });
});

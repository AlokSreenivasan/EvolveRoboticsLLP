import {
  registerDeviceForPushNotifications,
  unregisterDeviceForPushNotifications,
} from '../fcmTokenService';

import * as messagingModule from '@react-native-firebase/messaging';
import * as firestoreModule from '@react-native-firebase/firestore';

// Plain imports resolve to the manual mocks in __mocks__/ and share the
// instance the service module sees (jest.requireMock would create a copy).
const messagingMock = messagingModule as any;
const firestoreMock = firestoreModule as any;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('registerDeviceForPushNotifications', () => {
  it('requests permission, fetches the token, and persists it', async () => {
    await registerDeviceForPushNotifications('user-1');

    expect(messagingMock.requestPermission).toHaveBeenCalled();
    expect(messagingMock.getToken).toHaveBeenCalled();
    expect(firestoreMock.setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/user-1/fcmTokens/mock-fcm-token' }),
      expect.objectContaining({
        token: 'mock-fcm-token',
        platform: 'ios',
      }),
      { merge: true },
    );
  });

  it('does not persist anything when permission is denied', async () => {
    messagingMock.requestPermission.mockResolvedValueOnce(
      messagingMock.AuthorizationStatus.DENIED,
    );

    await registerDeviceForPushNotifications('user-1');

    expect(messagingMock.getToken).not.toHaveBeenCalled();
    expect(firestoreMock.setDoc).not.toHaveBeenCalled();
  });

  it('skips persistence when no token is available', async () => {
    messagingMock.getToken.mockResolvedValueOnce('');

    await registerDeviceForPushNotifications('user-1');

    expect(firestoreMock.setDoc).not.toHaveBeenCalled();
  });

  it('wraps unexpected failures in a service error', async () => {
    messagingMock.getToken.mockRejectedValueOnce(new Error('native down'));

    // wrapFirebaseError keeps the original message but tags the error code.
    await expect(registerDeviceForPushNotifications('user-1')).rejects.toMatchObject({
      code: 'PUSH_REGISTRATION_ERROR',
      message: 'native down',
    });
  });
});

describe('unregisterDeviceForPushNotifications', () => {
  it('deletes the device token and all stored token docs', async () => {
    const storedDocs = [
      { ref: { path: 'users/user-1/fcmTokens/t1' } },
      { ref: { path: 'users/user-1/fcmTokens/t2' } },
    ];
    firestoreMock.getDocs.mockResolvedValueOnce({
      docs: storedDocs,
      empty: false,
      size: 2,
      forEach: () => undefined,
    });

    await unregisterDeviceForPushNotifications('user-1');

    expect(messagingMock.deleteToken).toHaveBeenCalled();
    expect(firestoreMock.deleteDoc).toHaveBeenCalledTimes(2);
    expect(firestoreMock.deleteDoc).toHaveBeenCalledWith(storedDocs[0].ref);
  });

  it('still clears Firestore records when the device token delete fails', async () => {
    messagingMock.deleteToken.mockRejectedValueOnce(new Error('no token'));

    await expect(
      unregisterDeviceForPushNotifications('user-1'),
    ).resolves.toBeUndefined();
    expect(firestoreMock.getDocs).toHaveBeenCalled();
  });
});

import {
  handleBackgroundPushMessage,
  registerBackgroundPushHandler,
} from '../fcmBackgroundService';

const messaging = require('@react-native-firebase/messaging');

describe('fcmBackgroundService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers setBackgroundMessageHandler with the messaging instance', () => {
    registerBackgroundPushHandler();

    expect(messaging.setBackgroundMessageHandler).toHaveBeenCalledWith(
      messaging.__messagingInstance,
      handleBackgroundPushMessage,
    );
  });

  it('resolves without throwing for a background payload', async () => {
    await expect(
      handleBackgroundPushMessage({
        data: { type: 'live_notification' },
      } as never),
    ).resolves.toBeUndefined();
  });
});

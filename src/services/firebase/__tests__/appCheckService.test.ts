import { activateAppCheck } from '../appCheckService';

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: { APP_CHECK_DEBUG_TOKEN: 'test-debug-token' },
}));

const appCheck = require('@react-native-firebase/app-check') as {
  initializeAppCheck: jest.Mock;
};

describe('activateAppCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('configures debug providers in __DEV__ and initializes once', async () => {
    await activateAppCheck();
    await activateAppCheck();

    expect(appCheck.initializeAppCheck).toHaveBeenCalledTimes(1);
    expect(appCheck.initializeAppCheck).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        isTokenAutoRefreshEnabled: true,
        provider: {
          providerOptions: {
            android: {
              provider: 'debug',
              debugToken: 'test-debug-token',
            },
            apple: {
              provider: 'debug',
              debugToken: 'test-debug-token',
            },
          },
        },
      }),
    );
  });
});

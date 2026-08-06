class ReactNativeFirebaseAppCheckProvider {
  providerOptions = undefined;

  configure(options) {
    this.providerOptions = options;
  }

  getToken() {
    return Promise.resolve({
      token: 'mock-app-check-token',
      expireTimeMillis: Date.now() + 60_000,
    });
  }
}

const appCheckInstance = {
  __isMockAppCheck: true,
  initializeAppCheck: jest.fn(() => Promise.resolve()),
  getToken: jest.fn(() =>
    Promise.resolve({ token: 'mock-app-check-token' }),
  ),
};

module.exports = {
  __esModule: true,
  default: jest.fn(() => appCheckInstance),
  initializeAppCheck: jest.fn(() => Promise.resolve(appCheckInstance)),
  getToken: jest.fn(() =>
    Promise.resolve({ token: 'mock-app-check-token' }),
  ),
  getLimitedUseToken: jest.fn(() =>
    Promise.resolve({ token: 'mock-app-check-token' }),
  ),
  setTokenAutoRefreshEnabled: jest.fn(),
  onTokenChanged: jest.fn(() => jest.fn()),
  ReactNativeFirebaseAppCheckProvider,
  __appCheckInstance: appCheckInstance,
};

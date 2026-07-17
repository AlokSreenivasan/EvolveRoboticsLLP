const AuthorizationStatus = {
  NOT_DETERMINED: -1,
  DENIED: 0,
  AUTHORIZED: 1,
  PROVISIONAL: 2,
  EPHEMERAL: 3,
};

const messagingInstance = { __isMockMessaging: true };

module.exports = {
  __esModule: true,
  default: jest.fn(() => messagingInstance),
  getMessaging: jest.fn(() => messagingInstance),
  requestPermission: jest.fn(() => Promise.resolve(AuthorizationStatus.AUTHORIZED)),
  getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
  deleteToken: jest.fn(() => Promise.resolve()),
  onTokenRefresh: jest.fn(() => jest.fn()),
  onMessage: jest.fn(() => jest.fn()),
  setBackgroundMessageHandler: jest.fn(),
  AuthorizationStatus,
  NotificationAndroidPriority: {},
  NotificationAndroidVisibility: {},
  __messagingInstance: messagingInstance,
};

const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
};

const GoogleSignin = {
  configure: jest.fn(),
  hasPlayServices: jest.fn(() => Promise.resolve(true)),
  signIn: jest.fn(() =>
    Promise.resolve({
      type: 'success',
      data: { idToken: 'mock-google-id-token', user: { email: 'test@example.com' } },
    }),
  ),
  signOut: jest.fn(() => Promise.resolve()),
  hasPreviousSignIn: jest.fn(() => false),
  getTokens: jest.fn(() =>
    Promise.resolve({ idToken: 'mock-google-id-token', accessToken: 'mock-access-token' }),
  ),
  revokeAccess: jest.fn(() => Promise.resolve()),
};

module.exports = {
  __esModule: true,
  GoogleSignin,
  statusCodes,
  isSuccessResponse: jest.fn(response => response?.type === 'success'),
  isCancelledResponse: jest.fn(response => response?.type === 'cancelled'),
  isErrorWithCode: jest.fn(error => typeof error?.code === 'string'),
};

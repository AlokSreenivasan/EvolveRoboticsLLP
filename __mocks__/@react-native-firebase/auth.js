/**
 * Manual mock for @react-native-firebase/auth.
 *
 * Tests can control the signed-in user via `__setMockUser(userOrNull)` and
 * build fake users with `__createMockUser(overrides)`.
 */
const authInstance = {
  currentUser: null,
};

const authStateListeners = new Set();

function __createMockUser(overrides = {}) {
  return {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
    providerData: [{ providerId: 'password' }],
    reauthenticateWithCredential: jest.fn(() => Promise.resolve()),
    updatePassword: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
    getIdToken: jest.fn(() => Promise.resolve('mock-id-token')),
    ...overrides,
  };
}

function __setMockUser(user) {
  authInstance.currentUser = user;
  authStateListeners.forEach(listener => listener(user));
}

const onAuthStateChanged = jest.fn((_auth, listener) => {
  authStateListeners.add(listener);
  // Firebase always emits the current state on subscribe.
  Promise.resolve().then(() => listener(authInstance.currentUser));
  return () => authStateListeners.delete(listener);
});

module.exports = {
  __esModule: true,
  default: jest.fn(() => authInstance),
  getAuth: jest.fn(() => authInstance),
  onAuthStateChanged,
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: authInstance.currentUser })),
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: __createMockUser() }),
  ),
  signInWithCredential: jest.fn(() => Promise.resolve({ user: authInstance.currentUser })),
  signOut: jest.fn(() => {
    __setMockUser(null);
    return Promise.resolve();
  }),
  reload: jest.fn(() => Promise.resolve()),
  getIdToken: jest.fn(() => Promise.resolve('mock-id-token')),
  updateProfile: jest.fn(() => Promise.resolve()),
  updatePassword: jest.fn(() => Promise.resolve()),
  reauthenticateWithCredential: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  deleteUser: jest.fn(() => Promise.resolve()),
  EmailAuthProvider: {
    PROVIDER_ID: 'password',
    credential: jest.fn((email, password) => ({ email, password, providerId: 'password' })),
  },
  GoogleAuthProvider: {
    PROVIDER_ID: 'google.com',
    credential: jest.fn(idToken => ({ idToken, providerId: 'google.com' })),
  },
  __authInstance: authInstance,
  __createMockUser,
  __setMockUser,
};

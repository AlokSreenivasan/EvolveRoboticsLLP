/**
 * Manual mock for @react-native-firebase/firestore (modular API surface
 * used by src/services/firebase/firestoreClient.ts).
 */
const dbInstance = { __isMockFirestore: true };

const emptySnapshot = () => ({
  docs: [],
  empty: true,
  size: 0,
  forEach: () => undefined,
});

const docSnapshot = () => ({
  exists: () => false,
  data: () => undefined,
  id: 'mock-doc',
});

class Timestamp {
  constructor(seconds = 0, nanoseconds = 0) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  toDate() {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1e6);
  }

  toMillis() {
    return this.seconds * 1000 + this.nanoseconds / 1e6;
  }

  static now() {
    return Timestamp.fromDate(new Date());
  }

  static fromDate(date) {
    return new Timestamp(Math.floor(date.getTime() / 1000), (date.getTime() % 1000) * 1e6);
  }

  static fromMillis(millis) {
    return new Timestamp(Math.floor(millis / 1000), (millis % 1000) * 1e6);
  }
}

module.exports = {
  __esModule: true,
  default: jest.fn(() => dbInstance),
  getFirestore: jest.fn(() => dbInstance),
  collection: jest.fn((db, ...pathSegments) => ({ type: 'collection', path: pathSegments.join('/') })),
  doc: jest.fn((db, ...pathSegments) => ({ type: 'document', path: pathSegments.join('/') })),
  documentId: jest.fn(() => '__name__'),
  getDoc: jest.fn(() => Promise.resolve(docSnapshot())),
  getDocFromServer: jest.fn(() => Promise.resolve(docSnapshot())),
  getDocs: jest.fn(() => Promise.resolve(emptySnapshot())),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  onSnapshot: jest.fn(() => jest.fn()),
  query: jest.fn(target => target),
  where: jest.fn(() => ({ type: 'where' })),
  orderBy: jest.fn(() => ({ type: 'orderBy' })),
  limit: jest.fn(() => ({ type: 'limit' })),
  startAfter: jest.fn(() => ({ type: 'startAfter' })),
  runTransaction: jest.fn((db, updateFunction) =>
    updateFunction({
      get: jest.fn(() => Promise.resolve(docSnapshot())),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }),
  ),
  writeBatch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(() => Promise.resolve()),
  })),
  serverTimestamp: jest.fn(() => ({ __serverTimestamp: true })),
  enableNetwork: jest.fn(() => Promise.resolve()),
  waitForPendingWrites: jest.fn(() => Promise.resolve()),
  Timestamp,
  __dbInstance: dbInstance,
};

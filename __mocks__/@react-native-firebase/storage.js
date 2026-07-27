function createStorageRef(path = 'mock-path') {
  return {
    fullPath: path,
    putFile: jest.fn(() => Promise.resolve({ state: 'success' })),
    putString: jest.fn(() => Promise.resolve({ state: 'success' })),
    getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/mock.jpg')),
    delete: jest.fn(() => Promise.resolve()),
  };
}

const storageInstance = {
  ref: jest.fn(path => createStorageRef(path)),
  refFromURL: jest.fn(url => createStorageRef(url)),
};

module.exports = {
  __esModule: true,
  default: jest.fn(() => storageInstance),
  getStorage: jest.fn(() => storageInstance),
  ref: jest.fn((_storage, path) => createStorageRef(path)),
  putFile: jest.fn(() => Promise.resolve({ state: 'success' })),
  uploadString: jest.fn(() => Promise.resolve({ state: 'success' })),
  getDownloadURL: jest.fn(() =>
    Promise.resolve('https://example.com/mock.jpg'),
  ),
  deleteObject: jest.fn(() => Promise.resolve()),
  refFromURL: jest.fn(url => createStorageRef(url)),
  StringFormat: {
    RAW: 'raw',
    BASE64: 'base64',
    BASE64URL: 'base64url',
    DATA_URL: 'data_url',
  },
  __storageInstance: storageInstance,
  __createStorageRef: createStorageRef,
};

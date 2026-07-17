function createStorageRef(path = 'mock-path') {
  return {
    fullPath: path,
    putFile: jest.fn(() => Promise.resolve({ state: 'success' })),
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
  __storageInstance: storageInstance,
  __createStorageRef: createStorageRef,
};

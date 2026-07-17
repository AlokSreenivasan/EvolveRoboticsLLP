const functionsInstance = { __isMockFunctions: true };

module.exports = {
  __esModule: true,
  default: jest.fn(() => functionsInstance),
  getFunctions: jest.fn(() => functionsInstance),
  httpsCallable: jest.fn(() => jest.fn(() => Promise.resolve({ data: {} }))),
  __functionsInstance: functionsInstance,
};

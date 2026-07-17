const app = { name: '[DEFAULT]', options: {} };

module.exports = {
  __esModule: true,
  default: jest.fn(() => app),
  getApp: jest.fn(() => app),
  getApps: jest.fn(() => [app]),
  initializeApp: jest.fn(() => app),
};

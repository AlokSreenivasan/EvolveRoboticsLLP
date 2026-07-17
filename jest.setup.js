/* eslint-env jest */

// Firebase native modules are replaced by manual mocks in __mocks__/.
// The libraries below need explicit jest mocks or setup scripts.

require('react-native-gesture-handler/jestSetup');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock');
  return mock.default ?? mock;
});

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('@react-native-documents/picker', () => ({
  __esModule: true,
  pick: jest.fn(() => Promise.resolve([])),
  types: { pdf: 'application/pdf' },
  errorCodes: { OPERATION_CANCELED: 'OPERATION_CANCELED' },
  isErrorWithCode: jest.fn(error => typeof error?.code === 'string'),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  const DateTimePicker = props => React.createElement(View, props);
  return { __esModule: true, default: DateTimePicker };
});

jest.mock('react-native-image-picker', () => ({
  __esModule: true,
  launchImageLibrary: jest.fn(() => Promise.resolve({ didCancel: true })),
  launchCamera: jest.fn(() => Promise.resolve({ didCancel: true })),
}));

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  const WebView = props => React.createElement(View, props);
  return { __esModule: true, default: WebView, WebView };
});

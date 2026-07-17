module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/functions/',
    '<rootDir>/__tests__/rules/',
  ],
  // RN ships untranspiled ESM in node_modules; transform the RN ecosystem
  // packages (including @react-native-firebase) instead of ignoring them.
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|@react-native-firebase|@react-navigation|@react-native-google-signin|@react-native-documents|react-native-.*|lucide-react-native)',
  ],
};

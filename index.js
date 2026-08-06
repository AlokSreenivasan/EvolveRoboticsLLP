/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { registerBackgroundPushHandler } from './src/services/firebase/fcmBackgroundService';

// Required before AppRegistry so Android can resolve ReactNativeFirebaseMessagingHeadlessTask.
registerBackgroundPushHandler();

AppRegistry.registerComponent(appName, () => App);

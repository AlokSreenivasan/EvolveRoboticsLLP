/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { activateAppCheck } from './src/services/firebase/appCheckService';
import { registerBackgroundPushHandler } from './src/services/firebase/fcmBackgroundService';

// Required before AppRegistry so Android can resolve ReactNativeFirebaseMessagingHeadlessTask.
registerBackgroundPushHandler();

// Start App Check early so Auth / Functions / Firestore attach tokens.
void activateAppCheck();

AppRegistry.registerComponent(appName, () => App);

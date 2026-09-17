import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import PushRegistrationBootstrap from './components/PushRegistrationBootstrap.tsx';
import AppAlertProvider from './components/AppAlert/AppAlertProvider.tsx';
import AppNavigation from './navigation/AppNavigation.tsx';
import { AuthProvider } from './presentation/context/AuthContext.tsx';
import { configureGoogleSignIn } from './services/auth/googleSignInService';

function App() {
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return (
    <SafeAreaProvider>
      {Platform.OS === 'android' ? (
        <StatusBar barStyle="dark-content" />
      ) : null}
      <AuthProvider>
        <AppAlertProvider>
          <PushRegistrationBootstrap />
          <AppNavigation />
        </AppAlertProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;

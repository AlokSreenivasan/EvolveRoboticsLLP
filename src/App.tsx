import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigation from './navigation/AppNavigation.tsx';
import { AuthProvider } from './presentation/context/AuthContext.tsx';
import { configureGoogleSignIn } from './services/auth/googleSignInService';

function App() {
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;

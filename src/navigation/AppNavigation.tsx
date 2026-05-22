import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';

import IntroScreen from '../presentation/screens/Intro/IntroScreen';
import SplashScreen from '../presentation/screens/Splash/SplashScreen';

import AuthStack from './AuthStack';
import MainStack from './MainStack';

import { useAuth } from '../presentation/context/AuthContext';
import { AuthFlowProvider } from '../presentation/context/AuthFlowContext';
import {
  AuthEntryRoute,
  IntroFlowProvider,
} from '../presentation/context/IntroFlowContext';
import { MIN_SPLASH_DURATION_MS } from '../constants/appFlow';
import {
  isOnboardingComplete,
  markOnboardingComplete,
} from '../services/onboardingStorage';

const Stack = createNativeStackNavigator();

const fadeScreenOptions = {
  headerShown: false,
  animation: 'fade' as const,
  animationDuration: 200,
};

function AppNavigation() {
  const [bootstrapComplete, setBootstrapComplete] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [authInitialRoute, setAuthInitialRoute] =
    useState<AuthEntryRoute>('Login');
  /**
   * Set when leaving intro so we always show Login/SignUp first.
   * Cleared after explicit auth success (login/sign-up) so Home is reachable.
   */
  const [awaitingAuthFromIntro, setAwaitingAuthFromIntro] = useState(false);

  const { user, initializing } = useAuth();
  const hadUserRef = useRef(false);

  useEffect(() => {
    if (hadUserRef.current && !user) {
      setAuthInitialRoute('Login');
      setAwaitingAuthFromIntro(false);
    }
    hadUserRef.current = Boolean(user);
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const minSplashDelay = new Promise<void>(resolve => {
        setTimeout(resolve, MIN_SPLASH_DURATION_MS);
      });

      const onboardingDone = await isOnboardingComplete();

      // Reinstall clears AsyncStorage but Firebase may still restore a session
      // from the device keychain — sign out so intro → login flow works cleanly.
      const clearStaleSession =
        !onboardingDone && auth().currentUser
          ? auth().signOut()
          : Promise.resolve();

      await Promise.all([minSplashDelay, clearStaleSession]);

      if (cancelled) {
        return;
      }

      setShowIntro(!onboardingDone);
      if (onboardingDone) {
        setAuthInitialRoute('Login');
        setAwaitingAuthFromIntro(false);
      }
      setBootstrapComplete(true);
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const finishIntro = useCallback(async (route: AuthEntryRoute = 'Login') => {
    await markOnboardingComplete();
    setAuthInitialRoute(route);
    setAwaitingAuthFromIntro(true);
    setShowIntro(false);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setAwaitingAuthFromIntro(false);
  }, []);

  const showSplash = !bootstrapComplete || initializing;

  const rootScreen = useMemo(() => {
    if (showIntro) {
      return 'intro';
    }
    if (awaitingAuthFromIntro) {
      return 'auth';
    }
    if (user) {
      return 'main';
    }
    return 'auth';
  }, [showIntro, user, awaitingAuthFromIntro]);

  return (
    <View style={styles.root}>
      {bootstrapComplete && !initializing ? (
        <NavigationContainer>
          <IntroFlowProvider finishIntro={finishIntro}>
            <AuthFlowProvider onAuthSuccess={handleAuthSuccess}>
              <Stack.Navigator screenOptions={fadeScreenOptions}>
                {rootScreen === 'intro' ? (
                  <Stack.Screen name="Intro" component={IntroScreen} />
                ) : rootScreen === 'main' ? (
                  <Stack.Screen name="MainStack" component={MainStack} />
                ) : (
                  <Stack.Screen name="AuthStack">
                    {() => <AuthStack initialRoute={authInitialRoute} />}
                  </Stack.Screen>
                )}
              </Stack.Navigator>
            </AuthFlowProvider>
          </IntroFlowProvider>
        </NavigationContainer>
      ) : null}

      {showSplash ? (
        <View style={styles.splashOverlay} pointerEvents="auto">
          <SplashScreen />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: '#fff',
  },
});

export default AppNavigation;

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import IntroScreen from '../presentation/screens/Intro/IntroScreen';
import SplashScreen from '../presentation/screens/Splash/SplashScreen';

import AuthStack from './AuthStack';
import MainStack from './MainStack';

import { useAuth } from '../presentation/context/AuthContext';
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
  /** After intro, stay on auth until the user signs in (ignore persisted session). */
  const [introAuthRoute, setIntroAuthRoute] =
    useState<AuthEntryRoute | null>(null);

  const { user, initializing } = useAuth();
  const userAtIntroFinishRef = useRef(user);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const minSplashDelay = new Promise<void>(resolve => {
        setTimeout(resolve, MIN_SPLASH_DURATION_MS);
      });

      const [, onboardingDone] = await Promise.all([
        minSplashDelay,
        isOnboardingComplete(),
      ]);

      if (cancelled) {
        return;
      }

      setShowIntro(!onboardingDone);
      if (onboardingDone) {
        setAuthInitialRoute('Login');
      }
      setBootstrapComplete(true);
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const finishIntro = useCallback(
    async (route: AuthEntryRoute = 'Login') => {
      await markOnboardingComplete();
      userAtIntroFinishRef.current = user;
      setAuthInitialRoute(route);
      setIntroAuthRoute(route);
      setShowIntro(false);
    },
    [user],
  );

  // Allow Home redirect only after a fresh sign-in from the intro auth handoff.
  useEffect(() => {
    if (!introAuthRoute || !user) {
      return;
    }
    if (user !== userAtIntroFinishRef.current) {
      setIntroAuthRoute(null);
    }
  }, [user, introAuthRoute]);

  const showSplash = !bootstrapComplete || initializing;

  const rootScreen = useMemo(() => {
    if (showIntro) {
      return 'intro';
    }
    if (introAuthRoute) {
      return 'auth';
    }
    if (user) {
      return 'main';
    }
    return 'auth';
  }, [showIntro, user, introAuthRoute]);

  return (
    <View style={styles.root}>
      {bootstrapComplete && !initializing ? (
        <NavigationContainer>
          <IntroFlowProvider finishIntro={finishIntro}>
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

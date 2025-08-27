import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen.tsx';
import AboutScreen from '../screens/AboutScreen.tsx';
import SignUpScreen from '../screens/SignUpScreen.tsx';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen.tsx';
import HomeScreen from '../screens/HomeScreen.tsx';
import IntroScreen from '../screens/IntroScreen.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../screens/SplashScreen.tsx';
import { RootStackParamList } from '../types/navigation';

// const Stack = createNativeStackNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigation() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        // Add delay 2 seconds
        setTimeout(async () => {
          if (hasLaunched === null) {
            // First launch → show Intro
            await AsyncStorage.setItem('hasLaunched', 'true');
            setInitialRoute('Intro');
          } else {
            // Not first launch → go to Login
            setInitialRoute('Login');
          }
        }, 2000);
      } catch (error) {
        console.log('Error checking first launch', error);
        setInitialRoute('Login');
      }
    };

    checkFirstLaunch();
  }, []);

  if (!initialRoute) {
    // Show splash screen while checking AsyncStorage
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        // initialRouteName='Intro'

        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default AppNavigation;

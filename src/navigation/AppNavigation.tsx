import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import LoginScreen from '../presentation/screens/Auth/LoginScreen.tsx';
import AboutScreen from '../screens/AboutScreen.tsx';
import SignUpScreen from '../presentation/screens/Auth/SignUpScreen.tsx';
import ForgotPasswordScreen from '../presentation/screens/Auth/ForgotPasswordScreen.tsx';
import HomeScreen from '../presentation/screens/Home/HomeScreen.tsx';
import IntroScreen from '../presentation/screens/Intro/IntroScreen.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../presentation/screens/Splash/SplashScreen.tsx';
import ProfileScreen from '../presentation/screens/Profile/ProfileScreen.tsx';

// const Stack = createNativeStackNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigation() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  // useEffect(() => {
  //   const checkFirstLaunch = async () => {
  //     try {
  //       const hasLaunched = await AsyncStorage.getItem('hasLaunched');
  //       // Add delay 2 seconds
  //       setTimeout(async () => {
  //         if (hasLaunched === null) {
  //           // First launch → show Intro
  //           await AsyncStorage.setItem('hasLaunched', 'true');
  //           setInitialRoute('Intro');
  //         } else {
  //           // Not first launch → go to Login
  //           setInitialRoute('Login');
  //         }
  //       }, 2000);
  //     } catch (error) {
  //       console.log('Error checking first launch', error);
  //       setInitialRoute('Login');
  //     }
  //   };
  //
  //   checkFirstLaunch();
  // }, []);
  //
  // if (!initialRoute) {
  //   // Show splash screen while checking AsyncStorage
  //   return <SplashScreen />;
  // }SplashScreen

  return (
    <NavigationContainer>
      <Stack.Navigator
        // initialRouteName={initialRoute}
        initialRouteName='Login'

        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default AppNavigation;

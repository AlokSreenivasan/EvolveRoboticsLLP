import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../presentation/screens/Home/HomeScreen';
import AboutScreen from '../screens/AboutScreen';
import ProfileScreen from '../presentation/screens/Profile/ProfileScreen';
import SettingsScreen from '../presentation/screens/Settings/SettingsScreen';
import ChangePasswordScreen from '../presentation/screens/Settings/ChangePasswordScreen';
import PrivacySettingsScreen from '../presentation/screens/Settings/PrivacySettingsScreen';

import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}

export default MainStack;
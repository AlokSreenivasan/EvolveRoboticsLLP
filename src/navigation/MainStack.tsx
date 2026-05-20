import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../presentation/screens/Home/HomeScreen';
import AboutScreen from '../screens/AboutScreen';
import ProfileScreen from '../presentation/screens/Profile/ProfileScreen';
import SettingsScreen from '../presentation/screens/Settings/SettingsScreen';

import { ProfileDisplayProvider } from '../presentation/context/ProfileDisplayContext';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function MainStack() {
  return (
    <ProfileDisplayProvider>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
    </ProfileDisplayProvider>
  );
}

export default MainStack;
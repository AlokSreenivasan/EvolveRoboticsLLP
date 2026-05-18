import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../presentation/screens/Auth/LoginScreen';
import SignUpScreen from '../presentation/screens/Auth/SignUpScreen';
import ForgotPasswordScreen from '../presentation/screens/Auth/ForgotPasswordScreen';

import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

type AuthStackProps = {
  initialRoute?: keyof Pick<RootStackParamList, 'Login' | 'SignUp'>;
};

function AuthStack({ initialRoute = 'Login' }: AuthStackProps) {
  return (
    <Stack.Navigator
      key={initialRoute}
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
    </Stack.Navigator>
  );
}

export default AuthStack;
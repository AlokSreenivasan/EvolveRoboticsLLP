import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Intro: undefined;
  Login: undefined;
  About: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Home: undefined;
    // Add more screens here
};

// Navigation prop for a specific screen
export type LoginScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Login'
>;

export type AboutScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'About'
>;

// Route prop if you need to read route.params
export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;

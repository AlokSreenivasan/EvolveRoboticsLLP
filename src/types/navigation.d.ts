import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  ManageImportantUpdates: undefined;
  ManageUpcomingEvents: undefined;
  ManageCourses: undefined;
  ManageBanners: undefined;
  ManageUsers: undefined;
  AdminNotifications: undefined;
};

export type RootStackParamList = {
  Intro: undefined;
  Login: undefined;
  About: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  PrivacySettings: undefined;
  NotificationPreferences: undefined;
  Profile: undefined;
  /** Registered only for admin users after role resolves. */
  AdminStack: undefined;
  /** Fallback when a non-admin attempts restricted navigation. */
  Unauthorized: undefined;
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

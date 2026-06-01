import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CoursePlaylistScreen from '../presentation/screens/Courses/CoursePlaylistScreen';
import CourseVideoScreen from '../presentation/screens/Courses/CourseVideoScreen';
import CoursesScreen from '../presentation/screens/Courses/CoursesScreen';
import ContinueLearningListScreen from '../presentation/screens/Home/ContinueLearningListScreen';
import HomeScreen from '../presentation/screens/Home/HomeScreen';
import ResourcePdfViewerScreen from '../presentation/screens/Resources/ResourcePdfViewerScreen';
import AssignmentsScreen from '../presentation/screens/Assignments/AssignmentsScreen';
import ResourcesScreen from '../presentation/screens/Resources/ResourcesScreen';
import AboutScreen from '../presentation/screens/About/AboutScreen';
import ProfileScreen from '../presentation/screens/Profile/ProfileScreen';
import SettingsScreen from '../presentation/screens/Settings/SettingsScreen';
import ChangePasswordScreen from '../presentation/screens/Settings/ChangePasswordScreen';
import PrivacySettingsScreen from '../presentation/screens/Settings/PrivacySettingsScreen';
import NotificationPreferencesScreen from '../presentation/screens/Settings/NotificationPreferencesScreen';
import { HomeFeedProvider } from '../presentation/context/HomeFeedContext';
import { useUserRole } from '../presentation/hooks/useUserRole';

import AdminStackNavigator from './AdminStack';
import UnauthorizedRoute from './UnauthorizedRoute';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function MainStack() {
  const { isAdmin, roleLoading } = useUserRole();
  const showAdminStack = !roleLoading && isAdmin;

  return (
    <HomeFeedProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="ContinueLearningList"
        component={ContinueLearningListScreen}
      />
      <Stack.Screen name="Resources" component={ResourcesScreen} />
      <Stack.Screen name="Assignments" component={AssignmentsScreen} />
      <Stack.Screen
        name="ResourcePdfViewer"
        component={ResourcePdfViewerScreen}
      />
      <Stack.Screen name="Courses" component={CoursesScreen} />
      <Stack.Screen name="CoursePlaylist" component={CoursePlaylistScreen} />
      <Stack.Screen name="CourseVideo" component={CourseVideoScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Unauthorized" component={UnauthorizedRoute} />
      {showAdminStack ? (
        <Stack.Screen name="AdminStack" component={AdminStackNavigator} />
      ) : null}
      </Stack.Navigator>
    </HomeFeedProvider>
  );
}

export default MainStack;
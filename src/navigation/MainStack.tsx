import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CourseDetailScreen from '../presentation/screens/Courses/CourseDetailScreen';
import CoursePlaylistScreen from '../presentation/screens/Courses/CoursePlaylistScreen';
import CourseVideoScreen from '../presentation/screens/Courses/CourseVideoScreen';
import CoursesScreen from '../presentation/screens/Courses/CoursesScreen';
import ContinueLearningListScreen from '../presentation/screens/Home/ContinueLearningListScreen';
import ImportantUpdatesListScreen from '../presentation/screens/Home/ImportantUpdatesListScreen';
import NotificationsListScreen from '../presentation/screens/Home/NotificationsListScreen';
import UpcomingEventsListScreen from '../presentation/screens/Home/UpcomingEventsListScreen';
import HomeScreen from '../presentation/screens/Home/HomeScreen';
import ToDoScreen from '../presentation/screens/ToDo/ToDoScreen';
import ProjectsScreen from '../presentation/screens/Projects/ProjectsScreen';
import ProjectDetailScreen from '../presentation/screens/Projects/ProjectDetailScreen';
import ResourcePdfViewerScreen from '../presentation/screens/Resources/ResourcePdfViewerScreen';
import AssignmentsScreen from '../presentation/screens/Assignments/AssignmentsScreen';
import ResourcesScreen from '../presentation/screens/Resources/ResourcesScreen';
import ExamsScreen from '../presentation/screens/Exams/ExamsScreen';
import ExamAttemptScreen from '../presentation/screens/Exams/ExamAttemptScreen';
import ExamAttemptsScreen from '../presentation/screens/Exams/ExamAttemptsScreen';
import QuizCompetitionsScreen from '../presentation/screens/QuizCompetitions/QuizCompetitionsScreen';
import QuizAttemptScreen from '../presentation/screens/QuizCompetitions/QuizAttemptScreen';
import AboutScreen from '../presentation/screens/About/AboutScreen';
import ProfileScreen from '../presentation/screens/Profile/ProfileScreen';
import SettingsScreen from '../presentation/screens/Settings/SettingsScreen';
import ChangePasswordScreen from '../presentation/screens/Settings/ChangePasswordScreen';
import PrivacySettingsScreen from '../presentation/screens/Settings/PrivacySettingsScreen';
import NotificationPreferencesScreen from '../presentation/screens/Settings/NotificationPreferencesScreen';
import SupportScreen from '../presentation/screens/Settings/SupportScreen';
import ChatbotScreen from '../presentation/screens/Chatbot/ChatbotScreen';
import { HomeFeedProvider } from '../presentation/context/HomeFeedContext';
import { useUserRole } from '../presentation/hooks/useUserRole';

import AdminStackNavigator from './AdminStack';
import UnauthorizedRoute from './UnauthorizedRoute';
import { isProfileComplete } from '../domain/Profile/validation/isProfileComplete';
import { useAuth } from '../presentation/context/AuthContext';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function MainStack() {
  const { profile } = useAuth();
  const { isAdmin, roleLoading } = useUserRole();
  const showAdminStack = !roleLoading && isAdmin;
  // Wait for role so admin/superadmin are not forced through Learning Track.
  const needsProfileCompletion =
    !roleLoading && !isProfileComplete(profile);

  return (
    <HomeFeedProvider>
      <Stack.Navigator
        initialRouteName={needsProfileCompletion ? 'Profile' : 'Home'}
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ToDo" component={ToDoScreen} />
      <Stack.Screen name="Projects" component={ProjectsScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen
        name="ContinueLearningList"
        component={ContinueLearningListScreen}
      />
      <Stack.Screen
        name="NotificationsList"
        component={NotificationsListScreen}
      />
      <Stack.Screen
        name="ImportantUpdatesList"
        component={ImportantUpdatesListScreen}
      />
      <Stack.Screen
        name="UpcomingEventsList"
        component={UpcomingEventsListScreen}
      />
      <Stack.Screen name="Resources" component={ResourcesScreen} />
      <Stack.Screen name="Assignments" component={AssignmentsScreen} />
      <Stack.Screen name="Exams" component={ExamsScreen} />
      <Stack.Screen name="QuizCompetitions" component={QuizCompetitionsScreen} />
      <Stack.Screen name="QuizAttempt" component={QuizAttemptScreen} />
      <Stack.Screen name="ExamAttempt" component={ExamAttemptScreen} />
      <Stack.Screen name="ExamAttempts" component={ExamAttemptsScreen} />
      <Stack.Screen
        name="ResourcePdfViewer"
        component={ResourcePdfViewerScreen}
      />
      <Stack.Screen name="Courses" component={CoursesScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="CoursePlaylist" component={CoursePlaylistScreen} />
      <Stack.Screen name="CourseVideo" component={CourseVideoScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
      />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={
          needsProfileCompletion ? { requireCompletion: true } : undefined
        }
      />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
      <Stack.Screen name="Unauthorized" component={UnauthorizedRoute} />
      {showAdminStack ? (
        <Stack.Screen name="AdminStack" component={AdminStackNavigator} />
      ) : null}
      </Stack.Navigator>
    </HomeFeedProvider>
  );
}

export default MainStack;
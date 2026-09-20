import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../presentation/screens/Home/HomeScreen';
import ToDoScreen from '../presentation/screens/ToDo/ToDoScreen';
import ProfileScreen from '../presentation/screens/Profile/ProfileScreen';
import { HomeFeedProvider } from '../presentation/context/HomeFeedContext';
import { useUserRole } from '../presentation/hooks/useUserRole';
import LevelAchievementHost from '../components/Home/LevelAchievementHost';

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
  // Date of birth is required for every signed-in user.
  const needsProfileCompletion =
    !roleLoading && !isProfileComplete(profile);

  return (
    <HomeFeedProvider>
      <LevelAchievementHost />
      <Stack.Navigator
        initialRouteName={needsProfileCompletion ? 'Profile' : 'Home'}
        screenOptions={{ headerShown: false, statusBarStyle: 'dark' }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ToDo" component={ToDoScreen} />
        <Stack.Screen
          name="Projects"
          getComponent={() =>
            require('../presentation/screens/Projects/ProjectsScreen').default
          }
        />
        <Stack.Screen
          name="ProjectDetail"
          getComponent={() =>
            require('../presentation/screens/Projects/ProjectDetailScreen')
              .default
          }
        />
        <Stack.Screen
          name="ContinueLearningList"
          getComponent={() =>
            require('../presentation/screens/Home/ContinueLearningListScreen')
              .default
          }
        />
        <Stack.Screen
          name="NotificationsList"
          getComponent={() =>
            require('../presentation/screens/Home/NotificationsListScreen')
              .default
          }
        />
        <Stack.Screen
          name="ImportantUpdatesList"
          getComponent={() =>
            require('../presentation/screens/Home/ImportantUpdatesListScreen')
              .default
          }
        />
        <Stack.Screen
          name="UpcomingEventsList"
          getComponent={() =>
            require('../presentation/screens/Home/UpcomingEventsListScreen')
              .default
          }
        />
        <Stack.Screen
          name="Resources"
          getComponent={() =>
            require('../presentation/screens/Resources/ResourcesScreen').default
          }
        />
        <Stack.Screen
          name="Assignments"
          getComponent={() =>
            require('../presentation/screens/Assignments/AssignmentsScreen')
              .default
          }
        />
        <Stack.Screen
          name="Exams"
          getComponent={() =>
            require('../presentation/screens/Exams/ExamsScreen').default
          }
        />
        <Stack.Screen
          name="QuizCompetitions"
          getComponent={() =>
            require('../presentation/screens/QuizCompetitions/QuizCompetitionsScreen')
              .default
          }
        />
        <Stack.Screen
          name="QuizAttempt"
          getComponent={() =>
            require('../presentation/screens/QuizCompetitions/QuizAttemptScreen')
              .default
          }
        />
        <Stack.Screen
          name="ExamAttempt"
          getComponent={() =>
            require('../presentation/screens/Exams/ExamAttemptScreen').default
          }
        />
        <Stack.Screen
          name="ExamAttempts"
          getComponent={() =>
            require('../presentation/screens/Exams/ExamAttemptsScreen').default
          }
        />
        <Stack.Screen
          name="ResourcePdfViewer"
          getComponent={() =>
            require('../presentation/screens/Resources/ResourcePdfViewerScreen')
              .default
          }
        />
        <Stack.Screen
          name="Courses"
          getComponent={() =>
            require('../presentation/screens/Courses/CoursesScreen').default
          }
        />
        <Stack.Screen
          name="CourseDetail"
          getComponent={() =>
            require('../presentation/screens/Courses/CourseDetailScreen')
              .default
          }
        />
        <Stack.Screen
          name="CoursePlaylist"
          getComponent={() =>
            require('../presentation/screens/Courses/CoursePlaylistScreen')
              .default
          }
        />
        <Stack.Screen
          name="CourseVideo"
          getComponent={() =>
            require('../presentation/screens/Courses/CourseVideoScreen').default
          }
        />
        <Stack.Screen
          name="Settings"
          getComponent={() =>
            require('../presentation/screens/Settings/SettingsScreen').default
          }
        />
        <Stack.Screen
          name="ChangePassword"
          getComponent={() =>
            require('../presentation/screens/Settings/ChangePasswordScreen')
              .default
          }
        />
        <Stack.Screen
          name="PrivacySettings"
          getComponent={() =>
            require('../presentation/screens/Settings/PrivacySettingsScreen')
              .default
          }
        />
        <Stack.Screen
          name="PrivacyPolicy"
          getComponent={() =>
            require('../presentation/screens/Settings/PrivacyPolicyScreen')
              .default
          }
        />
        <Stack.Screen
          name="NotificationPreferences"
          getComponent={() =>
            require('../presentation/screens/Settings/NotificationPreferencesScreen')
              .default
          }
        />
        <Stack.Screen
          name="Support"
          getComponent={() =>
            require('../presentation/screens/Settings/SupportScreen').default
          }
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          initialParams={
            needsProfileCompletion ? { requireCompletion: true } : undefined
          }
        />
        <Stack.Screen
          name="About"
          getComponent={() =>
            require('../presentation/screens/About/AboutScreen').default
          }
        />
        <Stack.Screen
          name="ChatForum"
          getComponent={() =>
            require('../presentation/screens/Forum/ChatForumScreen').default
          }
        />
        <Stack.Screen
          name="ChatForumChannel"
          getComponent={() =>
            require('../presentation/screens/Forum/ChatForumChannelScreen')
              .default
          }
        />
        <Stack.Screen
          name="ChatbotScreen"
          getComponent={() =>
            require('../presentation/screens/Chatbot/ChatbotScreen').default
          }
        />
        <Stack.Screen name="Unauthorized" component={UnauthorizedRoute} />
        {showAdminStack ? (
          <Stack.Screen
            name="AdminStack"
            getComponent={() => require('./AdminStack').default}
          />
        ) : null}
      </Stack.Navigator>
    </HomeFeedProvider>
  );
}

export default MainStack;

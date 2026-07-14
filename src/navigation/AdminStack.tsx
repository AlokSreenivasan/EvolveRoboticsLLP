import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminRouteGuard from '../components/Admin/AdminRouteGuard';
import AdminFeatureRouteGuard from '../components/Admin/AdminFeatureRouteGuard';
import SuperAdminRouteGuard from '../components/Admin/SuperAdminRouteGuard';
import AdminDashboard from '../presentation/screens/Admin/AdminDashboard';
import AdminNotifications from '../presentation/screens/Admin/Notifications';
import ManageImportantUpdates from '../presentation/screens/Admin/ManageImportantUpdates';
import ManageAssignments from '../presentation/screens/Admin/ManageAssignments';
import ManageExams from '../presentation/screens/Admin/ManageExams';
import ManageQuizCompetitions from '../presentation/screens/Admin/ManageQuizCompetitions';
import ManageResources from '../presentation/screens/Admin/ManageResources';
import ManageUpcomingEvents from '../presentation/screens/Admin/ManageUpcomingEvents';
import ManageContinueLearningPlaylists from '../presentation/screens/Admin/ManageContinueLearningPlaylists';
import ManageCourses from '../presentation/screens/Admin/ManageCourses';
import ManageRoles from '../presentation/screens/Admin/ManageRoles';
import ManageUsers from '../presentation/screens/Admin/ManageUsers';
import ManageSchools from '../presentation/screens/Admin/ManageSchools';
import ManageChatKeywords from '../presentation/screens/Admin/ManageChatKeywords';
import ManageProjects from '../presentation/screens/Admin/ManageProjects';
import type { AdminStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<AdminStackParamList>();

function GuardedManageRoles() {
  return (
    <SuperAdminRouteGuard>
      <ManageRoles />
    </SuperAdminRouteGuard>
  );
}

function withAdminFeatureGuard<P extends object>(
  screen: keyof AdminStackParamList,
  Screen: React.ComponentType<P>,
): React.ComponentType<P> {
  function GuardedScreen(props: P) {
    return (
      <AdminFeatureRouteGuard screen={screen}>
        <Screen {...props} />
      </AdminFeatureRouteGuard>
    );
  }

  GuardedScreen.displayName = `AdminFeature(${String(screen)})`;
  return GuardedScreen;
}

const GuardedManageContinueLearningPlaylists = withAdminFeatureGuard(
  'ManageContinueLearningPlaylists',
  ManageContinueLearningPlaylists,
);
const GuardedManageImportantUpdates = withAdminFeatureGuard(
  'ManageImportantUpdates',
  ManageImportantUpdates,
);
const GuardedManageUpcomingEvents = withAdminFeatureGuard(
  'ManageUpcomingEvents',
  ManageUpcomingEvents,
);
const GuardedManageResources = withAdminFeatureGuard(
  'ManageResources',
  ManageResources,
);
const GuardedManageAssignments = withAdminFeatureGuard(
  'ManageAssignments',
  ManageAssignments,
);
const GuardedManageExams = withAdminFeatureGuard('ManageExams', ManageExams);
const GuardedManageQuizCompetitions = withAdminFeatureGuard(
  'ManageQuizCompetitions',
  ManageQuizCompetitions,
);
const GuardedManageCourses = withAdminFeatureGuard(
  'ManageCourses',
  ManageCourses,
);
const GuardedManageUsers = withAdminFeatureGuard('ManageUsers', ManageUsers);
const GuardedManageSchools = withAdminFeatureGuard(
  'ManageSchools',
  ManageSchools,
);
const GuardedManageChatKeywords = withAdminFeatureGuard(
  'ManageChatKeywords',
  ManageChatKeywords,
);
const GuardedManageProjects = withAdminFeatureGuard(
  'ManageProjects',
  ManageProjects,
);
const GuardedAdminNotifications = withAdminFeatureGuard(
  'AdminNotifications',
  AdminNotifications,
);

/**
 * Admin-only stack. Registered in MainStack only when the user is an admin.
 * Wrapped in {@link AdminRouteGuard} at the navigator level.
 * Plain `"admin"` users are limited to Resources, Assignments, Exams, and Quiz Competition.
 */
function AdminStackNavigator() {
  return (
    <AdminRouteGuard>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen
          name="ManageContinueLearningPlaylists"
          component={GuardedManageContinueLearningPlaylists}
        />
        <Stack.Screen
          name="ManageImportantUpdates"
          component={GuardedManageImportantUpdates}
        />
        <Stack.Screen
          name="ManageUpcomingEvents"
          component={GuardedManageUpcomingEvents}
        />
        <Stack.Screen
          name="ManageResources"
          component={GuardedManageResources}
        />
        <Stack.Screen
          name="ManageAssignments"
          component={GuardedManageAssignments}
        />
        <Stack.Screen name="ManageExams" component={GuardedManageExams} />
        <Stack.Screen
          name="ManageQuizCompetitions"
          component={GuardedManageQuizCompetitions}
        />
        <Stack.Screen name="ManageCourses" component={GuardedManageCourses} />
        <Stack.Screen name="ManageRoles" component={GuardedManageRoles} />
        <Stack.Screen name="ManageUsers" component={GuardedManageUsers} />
        <Stack.Screen name="ManageSchools" component={GuardedManageSchools} />
        <Stack.Screen
          name="ManageChatKeywords"
          component={GuardedManageChatKeywords}
        />
        <Stack.Screen name="ManageProjects" component={GuardedManageProjects} />
        <Stack.Screen
          name="AdminNotifications"
          component={GuardedAdminNotifications}
        />
      </Stack.Navigator>
    </AdminRouteGuard>
  );
}

export default AdminStackNavigator;

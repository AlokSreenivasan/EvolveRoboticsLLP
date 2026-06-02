import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminRouteGuard from '../components/Admin/AdminRouteGuard';
import AdminDashboard from '../presentation/screens/Admin/AdminDashboard';
import AdminNotifications from '../presentation/screens/Admin/Notifications';
import ManageBanners from '../presentation/screens/Admin/ManageBanners';
import ManageImportantUpdates from '../presentation/screens/Admin/ManageImportantUpdates';
import ManageAssignments from '../presentation/screens/Admin/ManageAssignments';
import ManageExams from '../presentation/screens/Admin/ManageExams';
import ManageResources from '../presentation/screens/Admin/ManageResources';
import ManageUpcomingEvents from '../presentation/screens/Admin/ManageUpcomingEvents';
import ManageContinueLearningPlaylists from '../presentation/screens/Admin/ManageContinueLearningPlaylists';
import ManageCourses from '../presentation/screens/Admin/ManageCourses';
import ManageUsers from '../presentation/screens/Admin/ManageUsers';
import type { AdminStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<AdminStackParamList>();

/**
 * Admin-only stack. Registered in MainStack only when the user is an admin.
 * Wrapped in {@link AdminRouteGuard} at the navigator level.
 */
function AdminStackNavigator() {
  return (
    <AdminRouteGuard>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen
          name="ManageContinueLearningPlaylists"
          component={ManageContinueLearningPlaylists}
        />
        <Stack.Screen
          name="ManageImportantUpdates"
          component={ManageImportantUpdates}
        />
        <Stack.Screen
          name="ManageUpcomingEvents"
          component={ManageUpcomingEvents}
        />
        <Stack.Screen name="ManageResources" component={ManageResources} />
        <Stack.Screen
          name="ManageAssignments"
          component={ManageAssignments}
        />
        <Stack.Screen name="ManageExams" component={ManageExams} />
        <Stack.Screen name="ManageCourses" component={ManageCourses} />
        <Stack.Screen name="ManageBanners" component={ManageBanners} />
        <Stack.Screen name="ManageUsers" component={ManageUsers} />
        <Stack.Screen
          name="AdminNotifications"
          component={AdminNotifications}
        />
      </Stack.Navigator>
    </AdminRouteGuard>
  );
}

export default AdminStackNavigator;

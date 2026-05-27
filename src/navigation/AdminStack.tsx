import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminRouteGuard from '../components/Admin/AdminRouteGuard';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import AdminNotifications from '../screens/Admin/Notifications';
import ManageBanners from '../screens/Admin/ManageBanners';
import ManageImportantUpdates from '../screens/Admin/ManageImportantUpdates';
import ManageCourses from '../screens/Admin/ManageCourses';
import ManageUsers from '../screens/Admin/ManageUsers';
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
          name="ManageImportantUpdates"
          component={ManageImportantUpdates}
        />
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

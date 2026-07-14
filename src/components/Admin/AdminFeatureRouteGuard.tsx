import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useUserRole } from '../../presentation/hooks/useUserRole';
import type { AdminStackParamList } from '../../types/navigation';
import { canAccessAdminDashboardScreen } from '../../utils/admin/adminDashboardAccess';
import AccessDenied from './AccessDenied';
import RoleLoadingView from './RoleLoadingView';
import UnauthorizedScreen from './UnauthorizedScreen';

type AdminFeatureRouteGuardProps = {
  children: React.ReactNode;
  screen: keyof AdminStackParamList;
  redirectOnDeny?: boolean;
  fullScreenDeny?: boolean;
};

/**
 * Restricts admin-stack screens that plain `"admin"` users cannot open.
 * Superadmins pass through; non-admins are already blocked by {@link AdminRouteGuard}.
 */
function AdminFeatureRouteGuard({
  children,
  screen,
  redirectOnDeny = true,
  fullScreenDeny = true,
}: AdminFeatureRouteGuardProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const { role, roleLoading } = useUserRole();
  const allowed = canAccessAdminDashboardScreen(role, screen);
  const hasRedirectedRef = useRef(false);

  const goToAdminDashboard = useCallback(() => {
    hasRedirectedRef.current = true;
    navigation.navigate('AdminDashboard');
  }, [navigation]);

  useEffect(() => {
    if (
      roleLoading ||
      allowed ||
      !redirectOnDeny ||
      hasRedirectedRef.current
    ) {
      return;
    }

    const timer = setTimeout(() => {
      goToAdminDashboard();
    }, 1200);

    return () => clearTimeout(timer);
  }, [roleLoading, allowed, redirectOnDeny, goToAdminDashboard]);

  if (roleLoading) {
    return <RoleLoadingView message="Checking administrator access…" />;
  }

  if (!allowed) {
    if (fullScreenDeny) {
      return (
        <UnauthorizedScreen
          title="Feature not available"
          description="Your admin account can only manage Resources, Assignments, Exams, and Quiz Competition."
          onGoHome={goToAdminDashboard}
          actionLabel="Back to Admin"
        />
      );
    }

    return (
      <AccessDenied
        title="Feature not available"
        description="Your admin account can only manage Resources, Assignments, Exams, and Quiz Competition."
        actionLabel="Back to Admin"
        onActionPress={goToAdminDashboard}
      />
    );
  }

  return <>{children}</>;
}

export default AdminFeatureRouteGuard;

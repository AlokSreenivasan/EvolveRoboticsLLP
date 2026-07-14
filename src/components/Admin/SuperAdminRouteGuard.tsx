import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useUserRole } from '../../presentation/hooks/useUserRole';
import type { AdminStackParamList } from '../../types/navigation';
import AccessDenied from './AccessDenied';
import RoleLoadingView from './RoleLoadingView';
import UnauthorizedScreen from './UnauthorizedScreen';

type SuperAdminRouteGuardProps = {
  children: React.ReactNode;
  redirectOnDeny?: boolean;
  fullScreenDeny?: boolean;
};

function SuperAdminRouteGuard({
  children,
  redirectOnDeny = true,
  fullScreenDeny = true,
}: SuperAdminRouteGuardProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const { isSuperAdmin, roleLoading } = useUserRole();
  const hasRedirectedRef = useRef(false);

  const goToAdminDashboard = useCallback(() => {
    hasRedirectedRef.current = true;
    navigation.navigate('AdminDashboard');
  }, [navigation]);

  useEffect(() => {
    if (
      roleLoading ||
      isSuperAdmin ||
      !redirectOnDeny ||
      hasRedirectedRef.current
    ) {
      return;
    }

    const timer = setTimeout(() => {
      goToAdminDashboard();
    }, 1200);

    return () => clearTimeout(timer);
  }, [roleLoading, isSuperAdmin, redirectOnDeny, goToAdminDashboard]);

  if (roleLoading) {
    return <RoleLoadingView message="Checking superadmin access…" />;
  }

  if (!isSuperAdmin) {
    if (fullScreenDeny) {
      return (
        <UnauthorizedScreen
          title="Superadmin access required"
          description="Only superadmins can manage user roles. Contact your platform owner if you need access."
          onGoHome={goToAdminDashboard}
          actionLabel="Back to Admin"
        />
      );
    }

    return (
      <AccessDenied
        title="Superadmin access required"
        description="Only superadmins can manage user roles."
        actionLabel="Back to Admin"
        onActionPress={goToAdminDashboard}
      />
    );
  }

  return <>{children}</>;
}

export default SuperAdminRouteGuard;

import React, { useCallback, useEffect, useRef } from 'react';
import {
  CommonActions,
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';

import { useUserRole } from '../../presentation/hooks/useUserRole';
import type { RootStackParamList } from '../../types/navigation';
import AccessDenied from './AccessDenied';
import RoleLoadingView from './RoleLoadingView';
import UnauthorizedScreen from './UnauthorizedScreen';

type AdminRouteGuardProps = {
  children: React.ReactNode;
  /**
   * When true (default), non-admins are redirected to Home after showing denied UI briefly.
   * When false, only renders AccessDenied without navigation side effects.
   */
  redirectOnDeny?: boolean;
  /** Use full-screen unauthorized layout instead of inline AccessDenied while redirecting. */
  fullScreenDeny?: boolean;
};

function AdminRouteGuard({
  children,
  redirectOnDeny = true,
  fullScreenDeny = true,
}: AdminRouteGuardProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isAdmin, roleLoading } = useUserRole();
  const hasRedirectedRef = useRef(false);

  const goHome = useCallback(() => {
    hasRedirectedRef.current = true;
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      }),
    );
  }, [navigation]);

  useEffect(() => {
    if (roleLoading || isAdmin || !redirectOnDeny || hasRedirectedRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      goHome();
    }, 1200);

    return () => clearTimeout(timer);
  }, [roleLoading, isAdmin, redirectOnDeny, goHome]);

  if (roleLoading) {
    return <RoleLoadingView message="Checking administrator access…" />;
  }

  if (!isAdmin) {
    if (fullScreenDeny) {
      return <UnauthorizedScreen onGoHome={goHome} />;
    }

    return <AccessDenied onActionPress={goHome} />;
  }

  return <>{children}</>;
}

/** Wraps a screen component so it is only reachable by admins. */
export function withAdminRouteGuard<P extends object>(
  Screen: React.ComponentType<P>,
  options?: Pick<AdminRouteGuardProps, 'redirectOnDeny' | 'fullScreenDeny'>,
): React.ComponentType<P> {
  function GuardedScreen(props: P) {
    return (
      <AdminRouteGuard
        redirectOnDeny={options?.redirectOnDeny}
        fullScreenDeny={options?.fullScreenDeny}>
        <Screen {...props} />
      </AdminRouteGuard>
    );
  }

  GuardedScreen.displayName = `AdminGuard(${Screen.displayName ?? Screen.name ?? 'Screen'})`;
  return GuardedScreen;
}

export default AdminRouteGuard;

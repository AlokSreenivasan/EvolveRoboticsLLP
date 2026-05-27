import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import type { RootStackParamList } from '../../types/navigation';
import { useUserRole } from './useUserRole';

/**
 * Safe navigation into admin routes — redirects non-admins to Unauthorized.
 */
export function useAdminNavigation() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isAdmin, roleLoading } = useUserRole();

  const openAdmin = useCallback(() => {
    if (roleLoading) {
      return false;
    }

    if (isAdmin) {
      navigation.navigate('AdminStack');
      return true;
    }

    navigation.navigate('Unauthorized');
    return false;
  }, [navigation, isAdmin, roleLoading]);

  return {
    isAdmin,
    roleLoading,
    openAdmin,
  };
}

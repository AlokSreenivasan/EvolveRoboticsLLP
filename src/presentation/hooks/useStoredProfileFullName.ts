import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { useProfileDisplay } from '../context/ProfileDisplayContext';

/** Shared display name; refreshes from storage when the screen gains focus. */
export function useStoredProfileFullName(): string {
  const { displayName, refreshProfile } = useProfileDisplay();

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile]),
  );

  return displayName;
}

import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { useProfileDisplay } from '../context/ProfileDisplayContext';

/** Shared display name for Home; refreshes from storage when the screen gains focus. */
export function useStoredProfileFullName(): string {
  const { displayName, refreshDisplayName } = useProfileDisplay();

  useFocusEffect(
    useCallback(() => {
      refreshDisplayName();
    }, [refreshDisplayName]),
  );

  return displayName;
}

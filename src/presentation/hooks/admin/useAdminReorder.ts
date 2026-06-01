import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { getErrorMessage } from '../../../utils/firebase/errors';

export function useAdminReorder<T extends { id: string }>(
  items: T[],
  moveFn: (id: string, direction: 'up' | 'down', items: T[]) => Promise<void>,
) {
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const handleMove = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      setReorderingId(id);
      try {
        await moveFn(id, direction, items);
      } catch (error) {
        Alert.alert('Reorder failed', getErrorMessage(error));
      } finally {
        setReorderingId(null);
      }
    },
    [items, moveFn],
  );

  return { reorderingId, handleMove };
}

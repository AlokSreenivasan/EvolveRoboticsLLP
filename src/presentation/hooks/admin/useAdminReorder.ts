import { useCallback, useState } from 'react';

import { appAlert, appAlertCopy } from '../../../utils/alert/appAlert';

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
      } catch {
        appAlert(
          appAlertCopy.admin.reorderFailedTitle,
          appAlertCopy.admin.reorderFailed,
        );
      } finally {
        setReorderingId(null);
      }
    },
    [items, moveFn],
  );

  return { reorderingId, handleMove };
}

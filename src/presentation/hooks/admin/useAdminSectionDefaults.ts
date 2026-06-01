import { useEffect } from 'react';

export function useAdminSectionDefaults(ensureFn: () => Promise<void>) {
  useEffect(() => {
    ensureFn().catch(() => undefined);
    // Run once on mount; ensureFn is a stable service import.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

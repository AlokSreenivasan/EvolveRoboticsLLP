import { useEffect, useMemo, useState } from 'react';

import { subscribeSchools } from '../../services/firebase/schoolsService';
import type { School } from '../../store/content/types/schools.types';
import { getErrorMessage } from '../../utils/firebase/errors';

export function useSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ready = false;

    const unsub = subscribeSchools(
      nextSchools => {
        setSchools(nextSchools);
        setError(null);
        ready = true;
        setLoading(false);
      },
      err => {
        setError(getErrorMessage(err));
        ready = true;
        setLoading(false);
      },
    );

    return () => {
      unsub();
      if (!ready) {
        setLoading(false);
      }
    };
  }, []);

  const displaySchools = useMemo(() => schools, [schools]);

  return {
    schools,
    displaySchools,
    loading,
    error,
  };
}

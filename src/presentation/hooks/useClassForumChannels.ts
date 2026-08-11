import { useEffect, useState } from 'react';

import {
  subscribeClassForumChannels,
} from '../../services/firebase/classForumService';
import type { ClassForumChannel } from '../../store/content/types/classForum.types';
import { getErrorMessage } from '../../utils/firebase';

export function useClassForumChannels(enabled: boolean) {
  const [channels, setChannels] = useState<ClassForumChannel[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setChannels([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeClassForumChannels(
      next => {
        setChannels(next);
        setLoading(false);
        setError(null);
      },
      err => {
        setLoading(false);
        setError(getErrorMessage(err));
      },
    );

    return unsubscribe;
  }, [enabled]);

  return { channels, loading, error };
}

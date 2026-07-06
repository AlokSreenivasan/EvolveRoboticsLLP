import { useEffect, useMemo, useState } from 'react';

import { subscribeChatKeywords } from '../../services/firebase/chatKeywordsService';
import type { ChatKeyword } from '../../store/content/types/chatKeywords.types';
import { getErrorMessage } from '../../utils/firebase/errors';

type UseChatKeywordsOptions = {
  /** When true, includes draft (unpublished) keywords — for admin screens. */
  includeUnpublished?: boolean;
};

export function useChatKeywords(options?: UseChatKeywordsOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const [keywords, setKeywords] = useState<ChatKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ready = false;

    const unsub = subscribeChatKeywords(
      nextKeywords => {
        setKeywords(nextKeywords);
        setError(null);
        ready = true;
        setLoading(false);
      },
      { includeUnpublished },
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
  }, [includeUnpublished]);

  const displayKeywords = useMemo(() => keywords, [keywords]);

  return {
    keywords,
    displayKeywords,
    loading,
    error,
  };
}

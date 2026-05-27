import { useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_IMPORTANT_UPDATES_SECTION,
} from '../../constants/importantUpdatesDefaults';
import {
  subscribeImportantUpdates,
  subscribeImportantUpdatesSection,
} from '../../services/firebase/importantUpdatesService';
import type {
  ImportantUpdateNotice,
  ImportantUpdatesSection,
} from '../../store/content/types/importantUpdates.types';
import { getErrorMessage } from '../../utils/firebase/errors';

type UseImportantUpdatesOptions = {
  /** When true, includes draft (unpublished) notices — for admin screens. */
  includeUnpublished?: boolean;
};

export function useImportantUpdates(options?: UseImportantUpdatesOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const [section, setSection] = useState<ImportantUpdatesSection>(
    DEFAULT_IMPORTANT_UPDATES_SECTION,
  );
  const [notices, setNotices] = useState<ImportantUpdateNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let sectionReady = false;
    let noticesReady = false;

    const markReady = () => {
      if (sectionReady && noticesReady) {
        setLoading(false);
      }
    };

    const unsubSection = subscribeImportantUpdatesSection(
      nextSection => {
        setSection(nextSection);
        sectionReady = true;
        markReady();
      },
      err => {
        setError(getErrorMessage(err));
        sectionReady = true;
        markReady();
      },
    );

    const unsubNotices = subscribeImportantUpdates(
      nextNotices => {
        setNotices(nextNotices);
        setError(null);
        noticesReady = true;
        markReady();
      },
      { includeUnpublished },
      err => {
        setError(getErrorMessage(err));
        noticesReady = true;
        markReady();
      },
    );

    return () => {
      unsubSection();
      unsubNotices();
    };
  }, [includeUnpublished]);

  const displayNotices = useMemo(() => {
    return notices;
  }, [notices]);

  return {
    section,
    notices,
    displayNotices,
    loading,
    error,
  };
}

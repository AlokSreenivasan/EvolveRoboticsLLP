import { useEffect, useState } from 'react';

import { DEFAULT_RESOURCES_SECTION } from '../../constants/resourcesDefaults';
import {
  subscribeResourceNotes,
  subscribeResourcesSection,
} from '../../services/firebase/resourcesService';
import type {
  ResourceNote,
  ResourcesSection,
} from '../../store/content/types/resources.types';
import { getErrorMessage } from '../../utils/firebase/errors';
import { useContentSubscribeOptions } from './useContentSubscribeOptions';

type UseResourcesOptions = {
  /** When true, includes draft (unpublished) notes — for admin screens. */
  includeUnpublished?: boolean;
};

export function useResources(options?: UseResourcesOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const subscribeOptions = useContentSubscribeOptions(includeUnpublished);
  const [section, setSection] = useState<ResourcesSection>(
    DEFAULT_RESOURCES_SECTION,
  );
  const [notes, setNotes] = useState<ResourceNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let sectionReady = false;
    let notesReady = false;

    const markReady = () => {
      if (sectionReady && notesReady) {
        setLoading(false);
      }
    };

    const unsubSection = subscribeResourcesSection(
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

    const unsubNotes = subscribeResourceNotes(
      nextNotes => {
        setNotes(nextNotes);
        setError(null);
        notesReady = true;
        markReady();
      },
      subscribeOptions,
      err => {
        setError(getErrorMessage(err));
        notesReady = true;
        markReady();
      },
    );

    return () => {
      unsubSection();
      unsubNotes();
    };
  }, [subscribeOptions]);

  return {
    section,
    notes,
    loading,
    error,
  };
}

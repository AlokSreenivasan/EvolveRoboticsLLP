import { useEffect, useState } from 'react';

import { DEFAULT_ASSIGNMENTS_SECTION } from '../../constants/assignmentsDefaults';
import {
  subscribeAssignments,
  subscribeAssignmentsSection,
} from '../../services/firebase/assignmentsService';
import type {
  Assignment,
  AssignmentsSection,
} from '../../store/content/types/assignments.types';
import { getErrorMessage } from '../../utils/firebase/errors';
import { useContentSubscribeOptions } from './useContentSubscribeOptions';

type UseAssignmentsOptions = {
  /** When true, includes draft (unpublished) assignments — for admin screens. */
  includeUnpublished?: boolean;
};

export function useAssignments(options?: UseAssignmentsOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const subscribeOptions = useContentSubscribeOptions(includeUnpublished);
  const [section, setSection] = useState<AssignmentsSection>(
    DEFAULT_ASSIGNMENTS_SECTION,
  );
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let sectionReady = false;
    let assignmentsReady = false;

    const markReady = () => {
      if (sectionReady && assignmentsReady) {
        setLoading(false);
      }
    };

    const unsubSection = subscribeAssignmentsSection(
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

    const unsubAssignments = subscribeAssignments(
      nextAssignments => {
        setAssignments(nextAssignments);
        setError(null);
        assignmentsReady = true;
        markReady();
      },
      subscribeOptions,
      err => {
        setError(getErrorMessage(err));
        assignmentsReady = true;
        markReady();
      },
    );

    return () => {
      unsubSection();
      unsubAssignments();
    };
  }, [subscribeOptions]);

  return {
    section,
    assignments,
    loading,
    error,
  };
}

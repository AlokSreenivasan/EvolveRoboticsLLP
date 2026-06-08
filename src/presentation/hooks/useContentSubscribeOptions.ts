import { useMemo } from 'react';

import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import { useContentViewerGradeId } from './useContentViewerGradeId';
import { useContentViewerSchoolId } from './useContentViewerSchoolId';

/** Firestore subscribe options for admin vs learner content lists. */
export function useContentSubscribeOptions(
  includeUnpublished = false,
): ContentSubscribeOptions {
  const viewerSchoolId = useContentViewerSchoolId();
  const viewerGrade = useContentViewerGradeId();

  return useMemo(() => {
    if (includeUnpublished) {
      return { includeUnpublished: true };
    }

    if (viewerSchoolId === undefined) {
      return { includeUnpublished: false };
    }

    return {
      includeUnpublished: false,
      viewerSchoolId,
      viewerGrade,
    };
  }, [includeUnpublished, viewerGrade, viewerSchoolId]);
}

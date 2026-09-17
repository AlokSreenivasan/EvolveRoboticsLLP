import { useMemo } from 'react';

import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import { useAuth } from '../context/AuthContext';
import { useContentViewerGradeId } from './useContentViewerGradeId';
import { useContentViewerSchoolId } from './useContentViewerSchoolId';

/** Firestore subscribe options for admin vs learner content lists. */
export function useContentSubscribeOptions(
  includeUnpublished = false,
): ContentSubscribeOptions {
  const { profile } = useAuth();
  const viewerSchoolId = useContentViewerSchoolId();
  const viewerGrade = useContentViewerGradeId();

  return useMemo(() => {
    if (includeUnpublished) {
      return { includeUnpublished: true };
    }

    const viewerTrack =
      profile?.track === 'kids' || profile?.track === 'professionals'
        ? profile.track
        : undefined;
    const isKids = viewerTrack === 'kids';

    return {
      includeUnpublished: false,
      viewerTrack,
      ...(isKids
        ? {
            viewerSchoolId: viewerSchoolId ?? null,
            viewerGrade,
          }
        : {}),
    };
  }, [
    includeUnpublished,
    profile?.track,
    viewerGrade,
    viewerSchoolId,
  ]);
}

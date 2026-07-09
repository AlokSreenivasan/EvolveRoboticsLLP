import { useMemo } from 'react';

import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import { useAuth } from '../context/AuthContext';
import { useContentViewerGradeId } from './useContentViewerGradeId';
import { useContentViewerSchoolId } from './useContentViewerSchoolId';

/** Firestore subscribe options for admin vs learner content lists. */
export function useContentSubscribeOptions(
  includeUnpublished = false,
): ContentSubscribeOptions {
  const { profile, isAdmin, roleLoading } = useAuth();
  const viewerSchoolId = useContentViewerSchoolId();
  const viewerGrade = useContentViewerGradeId();

  return useMemo(() => {
    if (includeUnpublished) {
      return { includeUnpublished: true };
    }

    if (roleLoading || isAdmin) {
      return { includeUnpublished: false };
    }

    const viewerTrack = profile?.track ?? undefined;
    const isKids = profile?.track === 'kids';

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
    isAdmin,
    profile?.track,
    roleLoading,
    viewerGrade,
    viewerSchoolId,
  ]);
}

import type { CourseTrack } from '../../store/content/types/courses.types';
import { isCourseTrack } from '../../store/content/types/courses.types';
import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import {
  filterByViewerSchool,
  filterByViewerTrack,
  filterPublishedContent,
  parseSchoolAudienceFromDoc,
  schoolAudienceToFirestorePayload,
} from '../../utils/content/schoolAudience';
import type { SchoolAudienceDocument, SchoolAudienceInput } from '../../store/content/types/schoolAudience.types';

export function mapSchoolAudienceFields(
  data: SchoolAudienceDocument | undefined,
) {
  return parseSchoolAudienceFromDoc(data);
}

export function mapContentTrack(
  data: { track?: unknown } | undefined,
): CourseTrack | null {
  return data && isCourseTrack(data.track) ? data.track : null;
}

export function buildSchoolAudienceWriteFields(input: SchoolAudienceInput) {
  return schoolAudienceToFirestorePayload(input);
}

export function buildTrackAwareSchoolAudienceWriteFields(
  track: CourseTrack,
  input: SchoolAudienceInput,
) {
  return buildSchoolAudienceWriteFields(
    track === 'kids'
      ? input
      : { audience: 'all', schoolIds: [], schoolGradeIds: {} },
  );
}

export function shouldApplyTrackAwareSchoolAudienceUpdate(
  input: SchoolAudienceInput & { track?: CourseTrack },
): boolean {
  return (
    input.audience !== undefined ||
    input.schoolIds !== undefined ||
    input.schoolGradeIds !== undefined ||
    input.track === 'professionals'
  );
}

export function applyLearnerContentFilters<
  T extends { isPublished: boolean; track?: CourseTrack | null } &
    ReturnType<typeof parseSchoolAudienceFromDoc>,
>(
  items: T[],
  options?: ContentSubscribeOptions,
): T[] {
  const includeUnpublished = options?.includeUnpublished === true;
  const published = filterPublishedContent(items, includeUnpublished);
  const byTrack = filterByViewerTrack(published, options?.viewerTrack);
  return filterByViewerSchool(byTrack, options);
}

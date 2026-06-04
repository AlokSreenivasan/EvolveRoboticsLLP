import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import {
  filterByViewerSchool,
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

export function buildSchoolAudienceWriteFields(input: SchoolAudienceInput) {
  return schoolAudienceToFirestorePayload(input);
}

export function applyLearnerContentFilters<
  T extends { isPublished: boolean } & ReturnType<typeof parseSchoolAudienceFromDoc>,
>(
  items: T[],
  options?: ContentSubscribeOptions,
): T[] {
  const includeUnpublished = options?.includeUnpublished === true;
  const published = filterPublishedContent(items, includeUnpublished);
  return filterByViewerSchool(published, options);
}

import type { School } from '../../store/content/types/schools.types';
import type {
  ContentSubscribeOptions,
  SchoolAudience,
  SchoolAudienceDocument,
  SchoolAudienceFields,
  SchoolAudienceInput,
} from '../../store/content/types/schoolAudience.types';

const MAX_SCHOOL_IDS = 50;

export function parseSchoolAudienceFromDoc(
  data: SchoolAudienceDocument | undefined,
): SchoolAudienceFields {
  const doc = data ?? {};
  const audience: SchoolAudience =
    doc.audience === 'schools' ? 'schools' : 'all';
  const rawIds = Array.isArray(doc.schoolIds) ? doc.schoolIds : [];
  const schoolIds = rawIds
    .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    .map(id => id.trim())
    .slice(0, MAX_SCHOOL_IDS);

  return {
    audience,
    schoolIds: audience === 'schools' ? schoolIds : [],
  };
}

export function schoolAudienceToFirestorePayload(
  input: SchoolAudienceInput,
): Pick<SchoolAudienceDocument, 'audience' | 'schoolIds'> {
  const audience: SchoolAudience =
    input.audience === 'schools' ? 'schools' : 'all';
  const rawIds = Array.isArray(input.schoolIds) ? input.schoolIds : [];
  const schoolIds = rawIds
    .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    .map(id => id.trim())
    .slice(0, MAX_SCHOOL_IDS);

  if (audience === 'schools') {
    return { audience: 'schools', schoolIds };
  }

  return { audience: 'all', schoolIds: [] };
}

export function isVisibleForViewerSchool(
  item: SchoolAudienceFields,
  viewerSchoolId: string | null | undefined,
): boolean {
  if (item.audience !== 'schools') {
    return true;
  }

  const schoolId = viewerSchoolId?.trim();
  if (!schoolId) {
    return false;
  }

  return item.schoolIds.includes(schoolId);
}

export function shouldFilterByViewerSchool(
  options?: ContentSubscribeOptions,
): boolean {
  return options != null && 'viewerSchoolId' in options;
}

export function filterPublishedContent<T extends { isPublished: boolean }>(
  items: T[],
  includeUnpublished: boolean,
): T[] {
  return includeUnpublished ? items : items.filter(item => item.isPublished);
}

export function filterByViewerSchool<T extends SchoolAudienceFields>(
  items: T[],
  options?: ContentSubscribeOptions,
): T[] {
  if (!shouldFilterByViewerSchool(options)) {
    return items;
  }

  return items.filter(item =>
    isVisibleForViewerSchool(item, options?.viewerSchoolId),
  );
}

export function validateSchoolAudienceInput(
  input: SchoolAudienceInput,
): string | null {
  const audience = input.audience === 'schools' ? 'schools' : 'all';
  if (audience !== 'schools') {
    return null;
  }

  const ids = Array.isArray(input.schoolIds)
    ? input.schoolIds.filter(id => typeof id === 'string' && id.trim().length > 0)
    : [];

  if (ids.length === 0) {
    return 'Select at least one school, or choose All schools.';
  }

  if (ids.length > MAX_SCHOOL_IDS) {
    return `You can select up to ${MAX_SCHOOL_IDS} schools.`;
  }

  return null;
}

export function formatSchoolAudienceSummary(
  fields: SchoolAudienceFields,
  schools: School[],
): string {
  if (fields.audience !== 'schools') {
    return 'All schools';
  }

  if (fields.schoolIds.length === 0) {
    return 'No schools selected';
  }

  const names = fields.schoolIds
    .map(id => schools.find(school => school.id === id)?.name?.trim())
    .filter((name): name is string => Boolean(name));

  if (names.length === 0) {
    return `${fields.schoolIds.length} school(s)`;
  }

  if (names.length <= 2) {
    return names.join(', ');
  }

  return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
}

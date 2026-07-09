import { getGradeLabel } from '../../constants/gradeOptions';
import type { CourseTrack } from '../../store/content/types/courses.types';
import type { School } from '../../store/content/types/schools.types';
import type {
  ContentSubscribeOptions,
  SchoolAudience,
  SchoolAudienceDocument,
  SchoolAudienceFields,
  SchoolAudienceInput,
  SchoolGradeIdsMap,
} from '../../store/content/types/schoolAudience.types';

const MAX_SCHOOL_IDS = 50;
const MAX_GRADES_PER_SCHOOL = 20;

function normalizeGradeIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return [
    ...new Set(
      raw
        .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
        .map(id => id.trim())
        .slice(0, MAX_GRADES_PER_SCHOOL),
    ),
  ];
}

function normalizeSchoolGradeIdsMap(
  raw: unknown,
  allowedSchoolIds: string[],
): SchoolGradeIdsMap {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }

  const allowed = new Set(allowedSchoolIds);
  const result: SchoolGradeIdsMap = {};

  for (const [schoolId, gradeIds] of Object.entries(raw)) {
    if (!allowed.has(schoolId)) {
      continue;
    }

    const normalized = normalizeGradeIds(gradeIds);
    if (normalized.length > 0) {
      result[schoolId] = normalized;
    }
  }

  return result;
}

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
  const schoolGradeIds =
    audience === 'schools'
      ? normalizeSchoolGradeIdsMap(doc.schoolGradeIds, schoolIds)
      : {};

  return {
    audience,
    schoolIds: audience === 'schools' ? schoolIds : [],
    schoolGradeIds,
  };
}

export function schoolAudienceToFirestorePayload(
  input: SchoolAudienceInput,
): Pick<SchoolAudienceDocument, 'audience' | 'schoolIds' | 'schoolGradeIds'> {
  const audience: SchoolAudience =
    input.audience === 'schools' ? 'schools' : 'all';
  const rawIds = Array.isArray(input.schoolIds) ? input.schoolIds : [];
  const schoolIds = rawIds
    .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    .map(id => id.trim())
    .slice(0, MAX_SCHOOL_IDS);

  if (audience === 'schools') {
    return {
      audience: 'schools',
      schoolIds,
      schoolGradeIds: normalizeSchoolGradeIdsMap(input.schoolGradeIds, schoolIds),
    };
  }

  return { audience: 'all', schoolIds: [], schoolGradeIds: {} };
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

export function isVisibleForViewerGrade(
  item: SchoolAudienceFields,
  viewerSchoolId: string | null | undefined,
  viewerGrade: string | null | undefined,
): boolean {
  if (item.audience !== 'schools') {
    return true;
  }

  const schoolId = viewerSchoolId?.trim();
  if (!schoolId) {
    return true;
  }

  const gradeIds = item.schoolGradeIds[schoolId];
  if (!gradeIds || gradeIds.length === 0) {
    return true;
  }

  const grade = viewerGrade?.trim();
  if (!grade) {
    return false;
  }

  return gradeIds.includes(grade);
}

export function isVisibleForViewer(
  item: SchoolAudienceFields,
  viewerSchoolId: string | null | undefined,
  viewerGrade?: string | null | undefined,
): boolean {
  if (!isVisibleForViewerSchool(item, viewerSchoolId)) {
    return false;
  }

  if (viewerGrade === undefined) {
    return true;
  }

  return isVisibleForViewerGrade(item, viewerSchoolId, viewerGrade);
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
    isVisibleForViewer(item, options?.viewerSchoolId, options?.viewerGrade),
  );
}

export function filterByViewerTrack<T extends { track?: CourseTrack | null }>(
  items: T[],
  viewerTrack?: CourseTrack,
): T[] {
  if (!viewerTrack) {
    return items;
  }

  return items.filter(
    item => item.track === viewerTrack || item.track == null,
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

  const rawSchoolGradeIds =
    input.schoolGradeIds != null &&
    typeof input.schoolGradeIds === 'object' &&
    !Array.isArray(input.schoolGradeIds)
      ? input.schoolGradeIds
      : {};

  for (const schoolId of ids) {
    const pendingGradeIds = rawSchoolGradeIds[schoolId];
    if (Array.isArray(pendingGradeIds) && pendingGradeIds.length === 0) {
      return 'Select at least one grade for each school using Selected grades, or switch to All grades.';
    }
  }

  const schoolGradeIds = normalizeSchoolGradeIdsMap(input.schoolGradeIds, ids);
  for (const schoolId of ids) {
    const gradeIds = schoolGradeIds[schoolId];
    if (gradeIds && gradeIds.length > MAX_GRADES_PER_SCHOOL) {
      return `You can select up to ${MAX_GRADES_PER_SCHOOL} grades per school.`;
    }
  }

  return null;
}

function formatSchoolGradeSummary(gradeIds: string[]): string {
  const labels = gradeIds
    .map(id => getGradeLabel(id) ?? id)
    .filter((label): label is string => Boolean(label));

  if (labels.length === 0) {
    return 'selected grades';
  }

  if (labels.length <= 2) {
    return labels.join(', ');
  }

  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2} more`;
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

  const parts = fields.schoolIds.map(schoolId => {
    const name = schools.find(school => school.id === schoolId)?.name?.trim();
    const schoolLabel = name || schoolId;
    const gradeIds = fields.schoolGradeIds[schoolId];

    if (gradeIds && gradeIds.length > 0) {
      return `${schoolLabel} (${formatSchoolGradeSummary(gradeIds)})`;
    }

    return schoolLabel;
  });

  if (parts.length <= 2) {
    return parts.join(' · ');
  }

  return `${parts.slice(0, 2).join(' · ')} +${parts.length - 2} more`;
}

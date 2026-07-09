import type { CourseTrack } from '../../store/content/types/courses.types';
import { courseTrackLabel } from '../../store/content/types/courses.types';
import type { School } from '../../store/content/types/schools.types';
import type {
  SchoolAudienceFields,
  SchoolAudienceInput,
} from '../../store/content/types/schoolAudience.types';
import { buildTrackAwareSchoolAudienceWriteFields } from '../../services/firebase/schoolAudienceFirestore';
import { formatSchoolAudienceSummary } from '../content/schoolAudience';

export function validateContentVisibilityTrack(
  track: CourseTrack | null | undefined,
): string | null {
  if (track !== 'kids' && track !== 'professionals') {
    return 'Select whether this is visible to kids or professionals.';
  }
  return null;
}

export function validateContentVisibility(
  track: CourseTrack | null | undefined,
  validateAudience: () => string | null,
): string | null {
  const trackError = validateContentVisibilityTrack(track);
  if (trackError) {
    return trackError;
  }

  if (track === 'kids') {
    return validateAudience();
  }

  return null;
}

export function buildContentVisibilityPayload(
  track: CourseTrack,
  audienceInput: SchoolAudienceInput,
) {
  return {
    track,
    ...buildTrackAwareSchoolAudienceWriteFields(track, audienceInput),
  };
}

export function formatContentVisibilitySummary(
  track: CourseTrack | null | undefined,
  fields: SchoolAudienceFields,
  schools: School[],
): string {
  if (track === 'kids') {
    return `${courseTrackLabel(track)} · ${formatSchoolAudienceSummary(fields, schools)}`;
  }

  return courseTrackLabel(track);
}

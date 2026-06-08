/** Who can see this content item or receive a targeted push. */
export type SchoolAudience = 'all' | 'schools';

/** Per-school grade filter. Empty/missing entry = all grades at that school. */
export type SchoolGradeIdsMap = Record<string, string[]>;

export interface SchoolAudienceDocument {
  audience?: SchoolAudience;
  schoolIds?: string[];
  schoolGradeIds?: SchoolGradeIdsMap;
}

export interface SchoolAudienceFields {
  audience: SchoolAudience;
  schoolIds: string[];
  schoolGradeIds: SchoolGradeIdsMap;
}

export type SchoolAudienceInput = {
  audience?: SchoolAudience;
  schoolIds?: string[];
  schoolGradeIds?: SchoolGradeIdsMap;
};

export type ContentSubscribeOptions = {
  /** Admin: include draft items. */
  includeUnpublished?: boolean;
  /**
   * Learner view: only items for all schools or this school id.
   * Omit to skip school filtering (admin lists).
   */
  viewerSchoolId?: string | null;
  /**
   * Learner view: used with school targeting to match per-school grades.
   * Omit to skip grade filtering (admin lists).
   */
  viewerGrade?: string | null;
};

/** Who can see this content item or receive a targeted push. */
export type SchoolAudience = 'all' | 'schools';

export interface SchoolAudienceDocument {
  audience?: SchoolAudience;
  schoolIds?: string[];
}

export interface SchoolAudienceFields {
  audience: SchoolAudience;
  schoolIds: string[];
}

export type SchoolAudienceInput = {
  audience?: SchoolAudience;
  schoolIds?: string[];
};

export type ContentSubscribeOptions = {
  /** Admin: include draft items. */
  includeUnpublished?: boolean;
  /**
   * Learner view: only items for all schools or this school id.
   * Omit to skip school filtering (admin lists).
   */
  viewerSchoolId?: string | null;
};

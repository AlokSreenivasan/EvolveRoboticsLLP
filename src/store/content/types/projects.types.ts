import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { CourseTrack } from './courses.types';
import type {
  SchoolAudienceDocument,
  SchoolAudienceFields,
  SchoolAudienceInput,
} from './schoolAudience.types';

/** Max gallery images per project (admin + Storage). */
export const PROJECT_MAX_IMAGES = 5;

/** Singleton config at appContent/projects */
export interface ProjectsSectionDocument {
  sectionTitle: string;
  sectionSubtitle: string;
  actionLabel: string;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
}

export interface ProjectsSection {
  sectionTitle: string;
  sectionSubtitle: string;
  actionLabel: string;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export interface ProjectDocument extends SchoolAudienceDocument {
  title: string;
  subtitle: string;
  description: string;
  /** Gallery image download URLs (0–5). */
  imageUris: string[];
  /**
   * @deprecated Prefer imageUris. Kept for older documents; first gallery
   * image is also mirrored here on write for backward-compatible reads.
   */
  imageUri?: string;
  /** Firebase Storage download URL for an attached .md brief (optional). */
  markdownUrl: string;
  track: CourseTrack;
  sortOrder: number;
  isPublished: boolean;
  createdAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
}

export interface Project extends SchoolAudienceFields {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  /** Gallery images to show one-by-one on the project detail screen. */
  imageUris: string[];
  /** First gallery image (card thumbnail); empty when none. */
  imageUri: string;
  markdownUrl: string;
  track: CourseTrack | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export type CreateProjectInput = {
  title: string;
  subtitle?: string;
  description?: string;
  imageUris?: string[];
  markdownUrl?: string;
  track: CourseTrack;
  isPublished?: boolean;
} & SchoolAudienceInput;

export type UpdateProjectInput = Partial<
  CreateProjectInput & { sortOrder: number }
>;

export type UpdateProjectsSectionInput = {
  sectionTitle: string;
  sectionSubtitle: string;
};

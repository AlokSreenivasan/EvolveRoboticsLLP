import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { CourseTrack } from './courses.types';
import type {
  SchoolAudienceDocument,
  SchoolAudienceFields,
  SchoolAudienceInput,
} from './schoolAudience.types';

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
  imageUri: string;
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
  imageUri: string;
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
  imageUri?: string;
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

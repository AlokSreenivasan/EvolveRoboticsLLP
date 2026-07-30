import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { CourseTrack } from './courses.types';
import type {
  SchoolAudienceDocument,
  SchoolAudienceFields,
  SchoolAudienceInput,
} from './schoolAudience.types';

/** Singleton config at appContent/resources */
export interface ResourcesSectionDocument {
  sectionTitle: string;
  sectionSubtitle: string;
  /**
   * Required by shared appContent Firestore rules.
   * When non-empty, used as the learner PDF card CTA label.
   */
  actionLabel: string;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
}

export interface ResourcesSection {
  sectionTitle: string;
  sectionSubtitle: string;
  actionLabel: string;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export interface ResourceNoteDocument extends SchoolAudienceDocument {
  title: string;
  subtitle: string;
  pdfUrl: string;
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

export interface ResourceNote extends SchoolAudienceFields {
  id: string;
  title: string;
  subtitle: string;
  pdfUrl: string;
  track: CourseTrack | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export type CreateResourceNoteInput = {
  title: string;
  subtitle?: string;
  pdfUrl: string;
  track: CourseTrack;
  isPublished?: boolean;
} & SchoolAudienceInput;

export type UpdateResourceNoteInput = Partial<
  CreateResourceNoteInput & { sortOrder: number }
>;

export type UpdateResourcesSectionInput = {
  sectionTitle: string;
  sectionSubtitle: string;
};

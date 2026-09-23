import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { CourseTrack } from './courses.types';
import type {
  SchoolAudienceDocument,
  SchoolAudienceFields,
  SchoolAudienceInput,
} from './schoolAudience.types';

/** Shared note category stored on appContent/resources. */
export interface ResourceNoteCategory {
  id: string;
  name: string;
}

/** Singleton config at appContent/resources */
export interface ResourcesSectionDocument {
  sectionTitle: string;
  sectionSubtitle: string;
  /**
   * Required by shared appContent Firestore rules.
   * When non-empty, used as the learner PDF card CTA label.
   */
  actionLabel: string;
  /** Optional so heading-only writes do not have to resend the list. */
  categories?: ResourceNoteCategory[];
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
}

export interface ResourcesSection {
  sectionTitle: string;
  sectionSubtitle: string;
  actionLabel: string;
  categories: ResourceNoteCategory[];
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export interface ResourceNoteDocument extends SchoolAudienceDocument {
  title: string;
  subtitle: string;
  pdfUrl: string;
  /** Empty when the note is not filed under a category. */
  categoryId?: string;
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
  categoryId: string;
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
  categoryId?: string;
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

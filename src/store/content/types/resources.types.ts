import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type {
  SchoolAudienceDocument,
  SchoolAudienceFields,
  SchoolAudienceInput,
} from './schoolAudience.types';

/** Singleton config at appContent/resources */
export interface ResourcesSectionDocument {
  sectionTitle: string;
  sectionSubtitle: string;
  /** Required by shared appContent Firestore rules; unused on the Resources screen. */
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
  sortOrder: number;
  isPublished: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export type CreateResourceNoteInput = {
  title: string;
  subtitle?: string;
  pdfUrl: string;
  isPublished?: boolean;
} & SchoolAudienceInput;

export type UpdateResourceNoteInput = Partial<
  CreateResourceNoteInput & { sortOrder: number }
>;

export type UpdateResourcesSectionInput = {
  sectionTitle: string;
  sectionSubtitle: string;
};

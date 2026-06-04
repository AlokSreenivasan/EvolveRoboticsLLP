import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type {
  SchoolAudienceDocument,
  SchoolAudienceFields,
  SchoolAudienceInput,
} from './schoolAudience.types';

/** Singleton config at appContent/importantUpdates */
export interface ImportantUpdatesSectionDocument {
  sectionTitle: string;
  sectionSubtitle: string;
  actionLabel: string;
  updatedAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
}

export interface ImportantUpdatesSection {
  sectionTitle: string;
  sectionSubtitle: string;
  actionLabel: string;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export interface ImportantUpdateNoticeDocument extends SchoolAudienceDocument {
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
  updatedAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
}

export interface ImportantUpdateNotice extends SchoolAudienceFields {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export type CreateImportantUpdateNoticeInput = {
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  isPublished?: boolean;
} & SchoolAudienceInput;

export type UpdateImportantUpdateNoticeInput = Partial<
  CreateImportantUpdateNoticeInput & { sortOrder: number }
>;

export type UpdateImportantUpdatesSectionInput = {
  sectionTitle: string;
  sectionSubtitle: string;
  actionLabel: string;
};

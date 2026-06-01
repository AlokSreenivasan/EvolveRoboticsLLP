import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/** Singleton config at appContent/assignments */
export interface AssignmentsSectionDocument {
  sectionTitle: string;
  sectionSubtitle: string;
  /** Required by shared appContent Firestore rules; unused on the Assignments screen. */
  actionLabel: string;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
}

export interface AssignmentsSection {
  sectionTitle: string;
  sectionSubtitle: string;
  actionLabel: string;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export interface AssignmentDocument {
  title: string;
  subtitle: string;
  dueDateLabel: string;
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

export interface Assignment {
  id: string;
  title: string;
  subtitle: string;
  dueDateLabel: string;
  pdfUrl: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export type CreateAssignmentInput = {
  title: string;
  subtitle?: string;
  dueDateLabel?: string;
  pdfUrl: string;
  isPublished?: boolean;
};

export type UpdateAssignmentInput = Partial<
  CreateAssignmentInput & { sortOrder: number }
>;

export type UpdateAssignmentsSectionInput = {
  sectionTitle: string;
  sectionSubtitle: string;
};

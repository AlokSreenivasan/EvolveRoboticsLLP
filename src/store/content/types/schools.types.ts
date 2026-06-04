import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface SchoolDocument {
  name: string;
  city: string;
  sortOrder: number;
  createdAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
}

export interface School {
  id: string;
  name: string;
  city: string;
  sortOrder: number;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export type CreateSchoolInput = {
  name: string;
  city?: string;
};

export type UpdateSchoolInput = {
  name?: string;
  city?: string;
  sortOrder?: number;
};

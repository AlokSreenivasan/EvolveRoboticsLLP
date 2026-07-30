import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type SchoolGrade = {
  id: string;
  name: string;
  sortOrder: number;
};

export interface SchoolDocument {
  name: string;
  city: string;
  sortOrder: number;
  grades?: SchoolGrade[];
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
  grades: SchoolGrade[];
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export type CreateSchoolInput = {
  name: string;
  city?: string;
  grades?: SchoolGrade[];
};

export type UpdateSchoolInput = {
  name?: string;
  city?: string;
  sortOrder?: number;
  grades?: SchoolGrade[];
};

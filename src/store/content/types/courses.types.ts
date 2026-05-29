import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type CourseDocument = {
  title: string;
  subtitle: string;
  imageUri: string;
  durationLabel: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: FirebaseFirestoreTypes.FieldValue;
  updatedAt: FirebaseFirestoreTypes.FieldValue;
};

export type Course = {
  id: string;
  title: string;
  subtitle: string;
  imageUri: string;
  durationLabel: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
};

export type CreateCourseInput = {
  title: string;
  subtitle: string;
  imageUri: string;
  durationLabel: string;
  description: string;
  isPublished?: boolean;
};

export type UpdateCourseInput = Partial<CreateCourseInput & { sortOrder: number }>;

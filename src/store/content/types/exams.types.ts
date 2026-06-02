import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type ExamChoice = {
  id: string;
  text: string;
};

export type ExamQuestion = {
  id: string;
  prompt: string;
  choices: [ExamChoice, ExamChoice, ExamChoice, ExamChoice];
  /** 0..3 */
  correctChoiceIndex: number;
};

export interface ExamDocument {
  title: string;
  description: string;
  /** Exam duration in seconds. */
  timerSeconds: number;
  questions: ExamQuestion[];
  sortOrder: number;
  isPublished: boolean;
  createdAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  timerSeconds: number;
  questions: ExamQuestion[];
  sortOrder: number;
  isPublished: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export type CreateExamInput = {
  title: string;
  description?: string;
  timerSeconds: number;
  questions: ExamQuestion[];
  isPublished?: boolean;
};

export type UpdateExamInput = Partial<CreateExamInput & { sortOrder: number }>;


import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { CourseTrack } from './courses.types';
import type {
  SchoolAudienceDocument,
  SchoolAudienceFields,
  SchoolAudienceInput,
} from './schoolAudience.types';

export type ExamChoice = {
  id: string;
  text: string;
};

export type ExamQuestion = {
  id: string;
  prompt: string;
  choices: [ExamChoice, ExamChoice, ExamChoice, ExamChoice];
  /**
   * 0..3 — present for admins after answer-key merge; omitted for learners.
   */
  correctChoiceIndex?: number;
};

export interface ExamDocument extends SchoolAudienceDocument {
  title: string;
  description: string;
  /** Exam duration in seconds. */
  timerSeconds: number;
  questions: ExamQuestion[];
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

export interface Exam extends SchoolAudienceFields {
  id: string;
  title: string;
  description: string;
  timerSeconds: number;
  questions: ExamQuestion[];
  track: CourseTrack | null;
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
  track: CourseTrack;
  isPublished?: boolean;
} & SchoolAudienceInput;

export type UpdateExamInput = Partial<CreateExamInput & { sortOrder: number }>;


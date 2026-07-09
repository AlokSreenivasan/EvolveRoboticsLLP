import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { CourseTrack } from './courses.types';
import type { ExamQuestion } from './exams.types';
import type {
  SchoolAudienceDocument,
  SchoolAudienceFields,
  SchoolAudienceInput,
} from './schoolAudience.types';

/** @deprecated Legacy single-question fields — mapped into `questions` at read time. */
export type LegacyQuizCompetitionDocument = {
  prompt?: string;
  choices?: Array<{ id?: string; text?: string }>;
  correctChoiceIndex?: number;
};

export interface QuizCompetitionDocument
  extends SchoolAudienceDocument,
    LegacyQuizCompetitionDocument {
  title: string;
  description: string;
  /** Quiz duration in seconds. */
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

export interface QuizCompetition extends SchoolAudienceFields {
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

export type CreateQuizCompetitionInput = {
  title: string;
  description?: string;
  timerSeconds: number;
  questions: ExamQuestion[];
  track: CourseTrack;
  isPublished?: boolean;
} & SchoolAudienceInput;

export type UpdateQuizCompetitionInput = Partial<
  CreateQuizCompetitionInput & { sortOrder: number }
>;

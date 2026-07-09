import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/** Learner track a course belongs to — required for catalog segregation. */
export type CourseTrack = 'kids' | 'professionals';

export const COURSE_TRACK_OPTIONS: ReadonlyArray<{
  value: CourseTrack;
  label: string;
  description: string;
}> = [
  {
    value: 'kids',
    label: 'For Kids',
    description: 'Shown when learners tap For Kids on Home.',
  },
  {
    value: 'professionals',
    label: 'For Professionals',
    description: 'Shown when learners tap For Professionals on Home.',
  },
] as const;

export function isCourseTrack(value: unknown): value is CourseTrack {
  return value === 'kids' || value === 'professionals';
}

export function courseTrackLabel(track: CourseTrack | null | undefined): string {
  if (track === 'kids') {
    return 'For Kids';
  }
  if (track === 'professionals') {
    return 'For Professionals';
  }
  return 'Unassigned';
}

export type CourseDocument = {
  title: string;
  subtitle: string;
  imageUri: string;
  durationLabel: string;
  description: string;
  /** Required: segregates catalog into kids vs professionals. */
  track: CourseTrack;
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
  track: CourseTrack | null;
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
  track: CourseTrack;
  isPublished?: boolean;
};

export type UpdateCourseInput = Partial<CreateCourseInput & { sortOrder: number }>;

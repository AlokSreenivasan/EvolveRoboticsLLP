import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { CourseTrack } from '../../content/types/courses.types';
import type { UserRole } from './role.types';

/** Firestore document shape at users/{uid} */
export interface UserProfileDocument {
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  /** Reference to schools/{schoolId}; null when not set. */
  schoolId: string | null;
  /** Student grade level; null when not set. */
  grade: string | null;
  /** Learner track — kids or professionals. */
  track: CourseTrack | null;
  /** Calendar birth year only; null until the learner declares age. */
  birthYear?: number | null;
  /** Set after a parent/guardian completes the in-app gate for under-13. */
  parentalConsentAt?:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue
    | null;
  role: UserRole;
  createdAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
  updatedAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
}

/** Normalized user profile used across the app */
export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  schoolId: string | null;
  grade: string | null;
  track: CourseTrack | null;
  birthYear: number | null;
  parentalConsentAtMs: number | null;
  role: UserRole;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export interface CreateUserProfileInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage?: string | null;
  schoolId?: string | null;
  grade?: string | null;
  track?: CourseTrack | null;
  birthYear?: number | null;
  parentalConsentAtMs?: number | null;
}

export type UpdateUserProfileInput = Partial<
  Pick<
    UserProfile,
    | 'fullName'
    | 'phoneNumber'
    | 'profileImage'
    | 'schoolId'
    | 'grade'
    | 'track'
    | 'birthYear'
    | 'parentalConsentAtMs'
  >
>;

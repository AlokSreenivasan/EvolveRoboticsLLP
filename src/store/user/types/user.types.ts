import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { UserRole } from './role.types';

/** Firestore document shape at users/{uid} */
export interface UserProfileDocument {
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
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
  role: UserRole;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export interface CreateUserProfileInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage?: string | null;
}

export type UpdateUserProfileInput = Partial<
  Pick<UserProfile, 'fullName' | 'phoneNumber' | 'profileImage'>
>;

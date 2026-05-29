import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type ContinueLearningPlaylistDocument = {
  title: string;
  subtitle: string;
  imageUri: string;
  playlistUrl: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: FirebaseFirestoreTypes.FieldValue;
  updatedAt: FirebaseFirestoreTypes.FieldValue;
};

export type ContinueLearningPlaylist = {
  id: string;
  title: string;
  subtitle: string;
  imageUri: string;
  playlistUrl: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
};

export type CreateContinueLearningPlaylistInput = {
  title: string;
  subtitle: string;
  imageUri: string;
  playlistUrl: string;
  isPublished?: boolean;
};

export type UpdateContinueLearningPlaylistInput = Partial<
  Omit<CreateContinueLearningPlaylistInput, 'isPublished'>
> & {
  sortOrder?: number;
  isPublished?: boolean;
};


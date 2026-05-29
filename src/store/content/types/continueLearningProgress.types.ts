import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type ContinueLearningProgressDocument = {
  videosWatched: number;
  updatedAt: FirebaseFirestoreTypes.FieldValue;
};

export type ContinueLearningProgress = {
  playlistId: string;
  videosWatched: number;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
};

import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type ContinueLearningProgressDocument = {
  videosWatched: number;
  hasStartedWatching?: boolean;
  updatedAt: FirebaseFirestoreTypes.FieldValue;
};

export type ContinueLearningProgress = {
  playlistId: string;
  videosWatched: number;
  hasStartedWatching: boolean;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
};

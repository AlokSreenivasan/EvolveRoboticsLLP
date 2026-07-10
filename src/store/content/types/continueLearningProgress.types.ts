import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type ContinueLearningProgressDocument = {
  videosWatched: number;
  hasStartedWatching?: boolean;
  watchSecondsByVideoId?: Record<string, number>;
  updatedAt: FirebaseFirestoreTypes.FieldValue;
};

export type ContinueLearningProgress = {
  playlistId: string;
  videosWatched: number;
  hasStartedWatching: boolean;
  watchSecondsByVideoId: Record<string, number>;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
};

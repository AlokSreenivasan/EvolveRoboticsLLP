import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { CourseTrack } from './courses.types';

export type ContinueLearningPlaylistDocument = {
  title: string;
  subtitle: string;
  imageUri: string;
  playlistUrl: string;
  videoCount: number;
  sortOrder: number;
  /** Required: segregates playlists into kids vs professionals. */
  track: CourseTrack;
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
  videoCount: number;
  sortOrder: number;
  track: CourseTrack | null;
  isPublished: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
};

export type CreateContinueLearningPlaylistInput = {
  title: string;
  subtitle: string;
  imageUri: string;
  playlistUrl: string;
  videoCount: number;
  track: CourseTrack;
  isPublished?: boolean;
};

export type UpdateContinueLearningPlaylistInput = Partial<
  Omit<CreateContinueLearningPlaylistInput, 'isPublished'>
> & {
  sortOrder?: number;
  isPublished?: boolean;
};


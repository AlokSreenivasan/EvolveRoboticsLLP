import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface ChatKeywordDocument {
  label: string;
  response: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
}

export interface ChatKeyword {
  id: string;
  label: string;
  response: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export type CreateChatKeywordInput = {
  label: string;
  response?: string;
  isPublished?: boolean;
};

export type UpdateChatKeywordInput = {
  label?: string;
  response?: string;
  sortOrder?: number;
  isPublished?: boolean;
};

export type ChatKeywordsSubscribeOptions = {
  includeUnpublished?: boolean;
};

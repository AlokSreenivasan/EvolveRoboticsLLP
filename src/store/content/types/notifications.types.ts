import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface AppNotificationDocument {
  title: string;
  body: string;
  sortOrder: number;
  isPublished: boolean;
  lastSentAt?: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
  createdAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
  updatedAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  sortOrder: number;
  isPublished: boolean;
  lastSentAt: FirebaseFirestoreTypes.Timestamp | null;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export type SendLiveNotificationResult = {
  successCount: number;
  failureCount: number;
  recipientCount: number;
};

export type CreateAppNotificationInput = {
  title: string;
  body: string;
  isPublished?: boolean;
};

export type UpdateAppNotificationInput = Partial<
  CreateAppNotificationInput & { sortOrder: number }
>;

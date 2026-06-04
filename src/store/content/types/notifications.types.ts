import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type {
  SchoolAudienceDocument,
  SchoolAudienceFields,
  SchoolAudienceInput,
} from './schoolAudience.types';

export interface AppNotificationDocument extends SchoolAudienceDocument {
  title: string;
  body: string;
  sortOrder: number;
  isPublished: boolean;
  lastSentAt?: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
  createdAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
  updatedAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
}

export interface AppNotification extends SchoolAudienceFields {
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
} & SchoolAudienceInput;

export type UpdateAppNotificationInput = Partial<
  CreateAppNotificationInput & { sortOrder: number }
>;

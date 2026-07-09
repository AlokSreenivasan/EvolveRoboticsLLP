import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { NotificationCategory } from '../../../constants/notificationCategories';
import type { CourseTrack } from './courses.types';
import type {
  SchoolAudienceDocument,
  SchoolAudienceFields,
  SchoolAudienceInput,
} from './schoolAudience.types';

export interface AppNotificationDocument extends SchoolAudienceDocument {
  title: string;
  body: string;
  category?: NotificationCategory;
  track: CourseTrack;
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
  category: NotificationCategory;
  track: CourseTrack | null;
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
  category?: NotificationCategory;
  track: CourseTrack;
  isPublished?: boolean;
} & SchoolAudienceInput;

export type UpdateAppNotificationInput = Partial<
  CreateAppNotificationInput & { sortOrder: number }
>;

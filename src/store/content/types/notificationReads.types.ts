import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/** Firestore document at users/{uid}/notificationReads/{notificationId} */
export type NotificationReadDocument = {
  readAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
};

export type NotificationRead = {
  notificationId: string;
  readAt: FirebaseFirestoreTypes.Timestamp | null;
};

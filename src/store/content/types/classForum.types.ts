import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { UserRole } from '../../user/types/role.types';

/** Firestore document at classForumChannels/{channelId} */
export interface ClassForumChannelDocument {
  schoolId: string;
  grade: string;
  schoolName: string;
  title: string;
  isLocked: boolean;
  messageCount: number;
  lastMessagePreview: string;
  lastMessageAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue | null;
  createdAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
  updatedAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
}

export interface ClassForumChannel {
  id: string;
  schoolId: string;
  grade: string;
  schoolName: string;
  title: string;
  isLocked: boolean;
  messageCount: number;
  lastMessagePreview: string;
  lastMessageAt: FirebaseFirestoreTypes.Timestamp | null;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

/** Firestore document at classForumChannels/{channelId}/messages/{messageId} */
export interface ClassForumMessageDocument {
  text: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  isPinned: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
  updatedAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
}

export interface ClassForumMessage {
  id: string;
  channelId: string;
  text: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  isPinned: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export interface CreateClassForumMessageInput {
  text: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
}

/** Firestore document at classForumChannels/{channelId}/reports/{reportId} */
export interface ClassForumReportDocument {
  messageId: string;
  messageText: string;
  reportedSenderId: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  createdAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
}

export interface CreateClassForumReportInput {
  messageId: string;
  messageText: string;
  reportedSenderId: string;
  reporterId: string;
  reporterName: string;
  reason: string;
}

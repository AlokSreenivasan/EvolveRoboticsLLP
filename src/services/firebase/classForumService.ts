import type {
  DocumentData,
  FirebaseFirestoreTypes,
  UpdateData,
} from '@react-native-firebase/firestore';

import type {
  ClassForumChannel,
  ClassForumChannelDocument,
  ClassForumMessage,
  ClassForumMessageDocument,
  CreateClassForumMessageInput,
  CreateClassForumReportInput,
} from '../../store/content/types/classForum.types';
import {
  buildClassForumChannelId,
  buildClassForumChannelTitle,
} from '../../utils/forum/classForumChannelId';
import {
  normalizeForumMessageText,
  normalizeForumReportReason,
  validateForumMessageText,
} from '../../utils/forum/classForumText';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { FIRESTORE_COLLECTIONS } from './constants';
import {
  collection,
  db,
  deleteDoc,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from './firestoreClient';

const MESSAGE_PAGE_SIZE = 80;

function isTimestamp(
  value: unknown,
): value is FirebaseFirestoreTypes.Timestamp {
  return (
    value != null &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as FirebaseFirestoreTypes.Timestamp).toDate === 'function'
  );
}

function channelsCollection() {
  return collection(db, FIRESTORE_COLLECTIONS.classForumChannels);
}

function channelRef(channelId: string) {
  return doc(channelsCollection(), channelId);
}

function messagesCollection(channelId: string) {
  return collection(
    db,
    FIRESTORE_COLLECTIONS.classForumChannels,
    channelId,
    'messages',
  );
}

function reportsCollection(channelId: string) {
  return collection(
    db,
    FIRESTORE_COLLECTIONS.classForumChannels,
    channelId,
    'reports',
  );
}

function mapChannel(
  id: string,
  data: ClassForumChannelDocument,
): ClassForumChannel {
  return {
    id,
    schoolId: data.schoolId?.trim() ?? '',
    grade: data.grade?.trim() ?? '',
    schoolName: data.schoolName?.trim() ?? '',
    title: data.title?.trim() ?? '',
    isLocked: data.isLocked === true,
    messageCount:
      typeof data.messageCount === 'number' ? data.messageCount : 0,
    lastMessagePreview: data.lastMessagePreview?.trim() ?? '',
    lastMessageAt: isTimestamp(data.lastMessageAt) ? data.lastMessageAt : null,
    createdAt: isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
  };
}

function mapMessage(
  channelId: string,
  id: string,
  data: ClassForumMessageDocument,
): ClassForumMessage {
  return {
    id,
    channelId,
    text: data.text?.trim() ?? '',
    senderId: data.senderId?.trim() ?? '',
    senderName: data.senderName?.trim() || 'Member',
    senderRole:
      data.senderRole === 'admin' || data.senderRole === 'superadmin'
        ? data.senderRole
        : 'user',
    isPinned: data.isPinned === true,
    createdAt: isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
  };
}

export function subscribeClassForumChannels(
  listener: (channels: ClassForumChannel[]) => void,
  onError?: (error: unknown) => void,
): () => void {
  const channelsQuery = query(
    channelsCollection(),
    orderBy('updatedAt', 'desc'),
  );

  return onSnapshot(
    channelsQuery,
    snapshot => {
      listener(
        snapshot.docs.map(channelDoc =>
          mapChannel(
            channelDoc.id,
            channelDoc.data() as ClassForumChannelDocument,
          ),
        ),
      );
    },
    error => onError?.(error),
  );
}

export function subscribeClassForumChannel(
  channelId: string,
  listener: (channel: ClassForumChannel | null) => void,
  onError?: (error: unknown) => void,
): () => void {
  return onSnapshot(
    channelRef(channelId),
    snapshot => {
      if (!snapshot.exists()) {
        listener(null);
        return;
      }
      listener(
        mapChannel(
          snapshot.id,
          snapshot.data() as ClassForumChannelDocument,
        ),
      );
    },
    error => onError?.(error),
  );
}

export function subscribeClassForumMessages(
  channelId: string,
  listener: (messages: ClassForumMessage[]) => void,
  onError?: (error: unknown) => void,
): () => void {
  const messagesQuery = query(
    messagesCollection(channelId),
    orderBy('createdAt', 'asc'),
    limit(MESSAGE_PAGE_SIZE),
  );

  return onSnapshot(
    messagesQuery,
    snapshot => {
      listener(
        snapshot.docs.map(messageDoc =>
          mapMessage(
            channelId,
            messageDoc.id,
            messageDoc.data() as ClassForumMessageDocument,
          ),
        ),
      );
    },
    error => onError?.(error),
  );
}

/**
 * Creates the class channel if missing. Safe to call repeatedly (merge).
 * Students may only ensure their own school+grade; admins may ensure any.
 */
export async function ensureClassForumChannel(input: {
  schoolId: string;
  grade: string;
  schoolName: string;
  gradeLabel: string;
}): Promise<ClassForumChannel> {
  const schoolId = input.schoolId.trim();
  const grade = input.grade.trim();
  if (!schoolId || !grade) {
    throw wrapFirebaseError(
      new Error('Missing school or grade'),
      'VALIDATION_ERROR',
      'School and grade are required to open a class forum.',
    );
  }

  const channelId = buildClassForumChannelId(schoolId, grade);
  const title = buildClassForumChannelTitle(
    input.schoolName,
    input.gradeLabel || grade,
  );

  try {
    const ref = channelRef(channelId);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      return mapChannel(
        existing.id,
        existing.data() as ClassForumChannelDocument,
      );
    }

    const payload: ClassForumChannelDocument = {
      schoolId,
      grade,
      schoolName: input.schoolName.trim() || 'School',
      title,
      isLocked: false,
      messageCount: 0,
      lastMessagePreview: '',
      lastMessageAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload);

    return mapChannel(channelId, {
      ...payload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to open class forum.',
    );
  }
}

export async function setClassForumChannelLocked(
  channelId: string,
  isLocked: boolean,
): Promise<void> {
  try {
    await updateDoc(channelRef(channelId), {
      isLocked,
      updatedAt: serverTimestamp(),
    } as UpdateData<DocumentData>);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to update channel lock.',
    );
  }
}

export async function postClassForumMessage(
  channelId: string,
  input: CreateClassForumMessageInput,
): Promise<void> {
  const validationError = validateForumMessageText(input.text);
  if (validationError) {
    throw wrapFirebaseError(
      new Error(validationError),
      'VALIDATION_ERROR',
      validationError,
    );
  }

  const text = normalizeForumMessageText(input.text);
  const preview =
    text.length > 120 ? `${text.slice(0, 117).trimEnd()}…` : text;

  try {
    const messageRef = doc(messagesCollection(channelId));
    const payload: ClassForumMessageDocument = {
      text,
      senderId: input.senderId,
      senderName: input.senderName.trim() || 'Member',
      senderRole: input.senderRole,
      isPinned: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(messageRef, payload);
    await updateDoc(channelRef(channelId), {
      lastMessagePreview: preview,
      lastMessageAt: serverTimestamp(),
      messageCount: increment(1),
      updatedAt: serverTimestamp(),
    } as UpdateData<DocumentData>);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to send message.',
    );
  }
}

export async function deleteClassForumMessage(
  channelId: string,
  messageId: string,
): Promise<void> {
  try {
    await deleteDoc(doc(messagesCollection(channelId), messageId));
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to delete message.',
    );
  }
}

export async function setClassForumMessagePinned(
  channelId: string,
  messageId: string,
  isPinned: boolean,
): Promise<void> {
  try {
    await updateDoc(doc(messagesCollection(channelId), messageId), {
      isPinned,
      updatedAt: serverTimestamp(),
    } as UpdateData<DocumentData>);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to update pin.',
    );
  }
}

export async function reportClassForumMessage(
  channelId: string,
  input: CreateClassForumReportInput,
): Promise<void> {
  const reason = normalizeForumReportReason(input.reason) || 'Inappropriate';

  try {
    const reportRef = doc(reportsCollection(channelId));
    await setDoc(reportRef, {
      messageId: input.messageId,
      messageText: input.messageText.slice(0, 1000),
      reportedSenderId: input.reportedSenderId,
      reporterId: input.reporterId,
      reporterName: input.reporterName.trim() || 'Member',
      reason,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to submit report.',
    );
  }
}

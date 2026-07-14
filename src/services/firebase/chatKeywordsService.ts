import type {
  DocumentData,
  FirebaseFirestoreTypes,
  UpdateData,
} from '@react-native-firebase/firestore';

import type {
  ChatKeyword,
  ChatKeywordDocument,
  ChatKeywordsSubscribeOptions,
  CreateChatKeywordInput,
  UpdateChatKeywordInput,
} from '../../store/content/types/chatKeywords.types';
import { filterPublishedContent } from '../../utils/content/schoolAudience';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { FIRESTORE_COLLECTIONS } from './constants';
import { buildSortedContentListQuery } from './contentListQuery';
import {
  collection,
  db,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from './firestoreClient';

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

function chatKeywordsCollection() {
  return collection(db, FIRESTORE_COLLECTIONS.chatKeywords);
}

function mapChatKeyword(id: string, data: ChatKeywordDocument): ChatKeyword {
  return {
    id,
    label: data.label?.trim() ?? '',
    response: data.response?.trim() ?? '',
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    isPublished: data.isPublished === true,
    createdAt: isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
  };
}

function sortChatKeywords(keywords: ChatKeyword[]): ChatKeyword[] {
  return [...keywords].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function subscribeChatKeywords(
  listener: (keywords: ChatKeyword[]) => void,
  options?: ChatKeywordsSubscribeOptions,
  onError?: (error: unknown) => void,
): () => void {
  const includeUnpublished = options?.includeUnpublished === true;
  const keywordsQuery = buildSortedContentListQuery(
    chatKeywordsCollection(),
    options,
  );

  return onSnapshot(
    keywordsQuery,
    snapshot => {
      const keywords = snapshot.docs.map(keywordDoc =>
        mapChatKeyword(keywordDoc.id, keywordDoc.data() as ChatKeywordDocument),
      );
      listener(
        sortChatKeywords(
          filterPublishedContent(keywords, includeUnpublished),
        ),
      );
    },
    error => onError?.(error),
  );
}

async function getNextSortOrder(): Promise<number> {
  const snapshot = await getDocs(
    query(chatKeywordsCollection(), orderBy('sortOrder', 'desc'), limit(1)),
  );

  if (snapshot.empty) {
    return 0;
  }

  const top = snapshot.docs[0].data() as ChatKeywordDocument;
  return (typeof top.sortOrder === 'number' ? top.sortOrder : 0) + 1;
}

export async function createChatKeyword(
  input: CreateChatKeywordInput,
): Promise<ChatKeyword> {
  try {
    const sortOrder = Math.trunc(await getNextSortOrder());
    const ref = doc(chatKeywordsCollection());
    const payload: ChatKeywordDocument = {
      label: input.label.trim(),
      response: input.response?.trim() ?? '',
      sortOrder,
      isPublished: input.isPublished === true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload);

    return mapChatKeyword(ref.id, {
      ...payload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to create chat keyword.',
    );
  }
}

export async function updateChatKeyword(
  keywordId: string,
  input: UpdateChatKeywordInput,
): Promise<void> {
  try {
    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (input.label !== undefined) {
      updates.label = input.label.trim();
    }
    if (input.response !== undefined) {
      updates.response = input.response.trim();
    }
    if (input.sortOrder !== undefined) {
      updates.sortOrder = input.sortOrder;
    }
    if (input.isPublished !== undefined) {
      updates.isPublished = input.isPublished;
    }

    await updateDoc(
      doc(chatKeywordsCollection(), keywordId),
      updates as UpdateData<DocumentData>,
    );
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to update chat keyword.',
    );
  }
}

export async function deleteChatKeyword(keywordId: string): Promise<void> {
  try {
    await deleteDoc(doc(chatKeywordsCollection(), keywordId));
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to delete chat keyword.',
    );
  }
}

export async function reorderChatKeywords(orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) {
    return;
  }

  try {
    const batch = writeBatch(db);

    orderedIds.forEach((id, index) => {
      batch.update(doc(chatKeywordsCollection(), id), {
        sortOrder: Math.trunc(index),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to reorder chat keywords.',
    );
  }
}

export async function moveChatKeyword(
  keywordId: string,
  direction: 'up' | 'down',
  currentKeywords: ChatKeyword[],
): Promise<void> {
  const ids = currentKeywords.map(keyword => keyword.id);
  const index = ids.indexOf(keywordId);

  if (index < 0) {
    return;
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= ids.length) {
    return;
  }

  const nextIds = [...ids];
  const [removed] = nextIds.splice(index, 1);
  nextIds.splice(targetIndex, 0, removed);

  await reorderChatKeywords(nextIds);
}

export function findChatKeywordResponse(
  keywords: ChatKeyword[],
  userMessage: string,
): string | null {
  const normalized = userMessage.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const match = keywords.find(
    keyword => keyword.label.trim().toLowerCase() === normalized,
  );

  return match?.response.trim() || null;
}

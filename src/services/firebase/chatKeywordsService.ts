import type {
  DocumentData,
  FirebaseFirestoreTypes,
  UpdateData,
} from '@react-native-firebase/firestore';

import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from '../../config/support';
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

export function computeMovedChatKeywordIds(
  keywordId: string,
  direction: 'up' | 'down',
  currentKeywords: ChatKeyword[],
): string[] | null {
  const ids = currentKeywords.map(keyword => keyword.id);
  const index = ids.indexOf(keywordId);

  if (index < 0) {
    return null;
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= ids.length) {
    return null;
  }

  const nextIds = [...ids];
  const [removed] = nextIds.splice(index, 1);
  nextIds.splice(targetIndex, 0, removed);
  return nextIds;
}

export async function moveChatKeyword(
  keywordId: string,
  direction: 'up' | 'down',
  currentKeywords: ChatKeyword[],
): Promise<void> {
  const nextIds = computeMovedChatKeywordIds(
    keywordId,
    direction,
    currentKeywords,
  );
  if (!nextIds) {
    return;
  }

  await reorderChatKeywords(nextIds);
}

const MIN_FUZZY_MATCH_LENGTH = 3;

export const STARTER_CHAT_KEYWORD_LIMIT = 6;

export const UNMATCHED_CHAT_REPLY =
  `I don't have an answer for that yet. Contact Evolve support at ${SUPPORT_PHONE} or ${SUPPORT_EMAIL}. You can also try one of the topics below.`;

export const MATCHED_CHAT_SUPPORT_NOTE =
  `If this answer does not meet your requirement, connect with the support team at ${SUPPORT_PHONE} or ${SUPPORT_EMAIL}.`;

export function withMatchedSupportNote(answer: string): string {
  return `${answer}\n\n${MATCHED_CHAT_SUPPORT_NOTE}`;
}

function normalizeChatText(value: string): string {
  return value.trim().toLowerCase();
}

function isUsableChatKeyword(keyword: ChatKeyword): boolean {
  return Boolean(keyword.label.trim() && keyword.response.trim());
}

function longestLabelFirst(left: ChatKeyword, right: ChatKeyword): number {
  return (
    normalizeChatText(right.label).length - normalizeChatText(left.label).length
  );
}

export function getStarterChatKeywords(
  keywords: ChatKeyword[],
  limit: number = STARTER_CHAT_KEYWORD_LIMIT,
): ChatKeyword[] {
  return keywords.filter(isUsableChatKeyword).slice(0, limit);
}

export function filterChatKeywordsByQuery(
  keywords: ChatKeyword[],
  query: string,
): ChatKeyword[] {
  const normalized = normalizeChatText(query);
  if (normalized.length < 2) {
    return keywords;
  }

  return keywords.filter(keyword =>
    normalizeChatText(keyword.label).includes(normalized),
  );
}

export function findRelatedChatKeywords(
  keywords: ChatKeyword[],
  userMessage: string,
  limit: number = STARTER_CHAT_KEYWORD_LIMIT,
): ChatKeyword[] {
  const words = normalizeChatText(userMessage)
    .split(/\s+/)
    .filter(word => word.length >= MIN_FUZZY_MATCH_LENGTH);

  if (words.length === 0) {
    return getStarterChatKeywords(keywords, limit);
  }

  const related = keywords.filter(keyword => {
    if (!isUsableChatKeyword(keyword)) {
      return false;
    }

    const label = normalizeChatText(keyword.label);
    return words.some(word => label.includes(word));
  });

  if (related.length === 0) {
    return getStarterChatKeywords(keywords, limit);
  }

  return related.slice(0, limit);
}

export function findMatchingChatKeyword(
  keywords: ChatKeyword[],
  userMessage: string,
): ChatKeyword | null {
  const normalized = normalizeChatText(userMessage);
  if (!normalized) {
    return null;
  }

  const usable = keywords.filter(isUsableChatKeyword);

  const exact = usable.find(
    keyword => normalizeChatText(keyword.label) === normalized,
  );
  if (exact) {
    return exact;
  }

  const contained = usable
    .filter(keyword => {
      const label = normalizeChatText(keyword.label);
      return label.length >= MIN_FUZZY_MATCH_LENGTH && normalized.includes(label);
    })
    .sort(longestLabelFirst);
  if (contained[0]) {
    return contained[0];
  }

  if (normalized.length < MIN_FUZZY_MATCH_LENGTH) {
    return null;
  }

  const prefixed = usable
    .filter(keyword =>
      normalizeChatText(keyword.label).startsWith(normalized),
    )
    .sort(longestLabelFirst);

  return prefixed[0] ?? null;
}

export function findChatKeywordResponse(
  keywords: ChatKeyword[],
  userMessage: string,
): string | null {
  return findMatchingChatKeyword(keywords, userMessage)?.response.trim() || null;
}

export function resolveAssistantReply(
  keywords: ChatKeyword[],
  userMessage: string,
  explicitResponse?: string,
): string {
  const explicit = explicitResponse?.trim();
  if (explicit) {
    return explicit;
  }

  const matched = findChatKeywordResponse(keywords, userMessage);
  if (matched) {
    return withMatchedSupportNote(matched);
  }

  return UNMATCHED_CHAT_REPLY;
}

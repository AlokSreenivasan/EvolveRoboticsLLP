import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import { limit, orderBy, query, startAfter, where } from './firestoreClient';

type CollectionLike = Parameters<typeof query>[0];

export type ContentListCursor = FirebaseFirestoreTypes.QueryDocumentSnapshot;

export type ContentListPageMeta = {
  cursor: ContentListCursor | null;
  hasMore: boolean;
};

/** First-page size for learner catalogs and Home feed collections. */
export const LEARNER_CONTENT_PAGE_SIZE = 30;

export function resolveContentListPageSize(
  options?: ContentSubscribeOptions,
): number | undefined {
  if (options?.includeUnpublished === true || options?.unbounded === true) {
    return undefined;
  }

  return options?.pageSize ?? LEARNER_CONTENT_PAGE_SIZE;
}

export function contentListPageMeta(
  snapshot: { docs: Array<{ id: string }> },
  pageSize?: number,
): ContentListPageMeta {
  const docs = snapshot.docs;
  return {
    cursor: (docs.length > 0 ? docs[docs.length - 1] : null) as ContentListCursor | null,
    hasMore: pageSize != null && docs.length >= pageSize,
  };
}

export function mergeContentListPages<T extends { id: string }>(
  livePage: T[],
  extraPages: T[],
): T[] {
  const liveIds = new Set(livePage.map(item => item.id));
  return [...livePage, ...extraPages.filter(item => !liveIds.has(item.id))];
}

/**
 * List query aligned with firestore.rules published-content reads.
 *
 * Learners: isPublished equality + sortOrder (composite indexes in
 * firestore.indexes.json) and a default page cap.
 * Admins (includeUnpublished): orderBy sortOrder across all docs, unbounded.
 */
export function buildSortedContentListQuery(
  collectionRef: CollectionLike,
  options?: ContentSubscribeOptions,
) {
  const pageSize = resolveContentListPageSize(options);
  const constraints: ReturnType<typeof where | typeof orderBy | typeof limit | typeof startAfter>[] =
    options?.includeUnpublished === true
      ? [orderBy('sortOrder', 'asc')]
      : [where('isPublished', '==', true), orderBy('sortOrder', 'asc')];

  if (options?.startAfter) {
    constraints.push(
      startAfter(options.startAfter as ContentListCursor),
    );
  }

  if (pageSize != null) {
    constraints.push(limit(pageSize));
  }

  return query(collectionRef, ...constraints);
}

import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import {
  buildSortedContentListQuery,
  contentListPageMeta,
  resolveContentListPageSize,
  type ContentListPageMeta,
} from './contentListQuery';
import { getDocs, onSnapshot } from './firestoreClient';

type CollectionLike = Parameters<typeof buildSortedContentListQuery>[0];

type DocsSnapshot = {
  docs: Array<{ id: string; data: () => unknown }>;
};

export function subscribeSortedContentList<T>(
  collectionRef: CollectionLike,
  options: ContentSubscribeOptions | undefined,
  mapItems: (snapshot: DocsSnapshot) => T[],
  listener: (items: T[], meta: ContentListPageMeta) => void,
  onError?: (error: unknown) => void,
): () => void {
  const pageSize = resolveContentListPageSize(options);

  return onSnapshot(
    buildSortedContentListQuery(collectionRef, options),
    snapshot => {
      listener(
        mapItems(snapshot),
        contentListPageMeta(snapshot, pageSize),
      );
    },
    error => onError?.(error),
  );
}

export async function fetchSortedContentListPage<T>(
  collectionRef: CollectionLike,
  options: ContentSubscribeOptions | undefined,
  mapItems: (snapshot: DocsSnapshot) => T[],
): Promise<{ items: T[]; meta: ContentListPageMeta }> {
  const pageSize = resolveContentListPageSize(options);
  const snapshot = await getDocs(
    buildSortedContentListQuery(collectionRef, options),
  );

  return {
    items: mapItems(snapshot),
    meta: contentListPageMeta(snapshot, pageSize),
  };
}

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  mergeContentListPages,
  resolveContentListPageSize,
  type ContentListCursor,
  type ContentListPageMeta,
} from '../../services/firebase/contentListQuery';
import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import { getErrorMessage } from '../../utils/firebase/errors';

type SubscribeFn<T> = (
  listener: (items: T[], meta?: ContentListPageMeta) => void,
  options?: ContentSubscribeOptions,
  onError?: (error: unknown) => void,
) => () => void;

type FetchPageFn<T> = (
  options?: ContentSubscribeOptions,
) => Promise<{ items: T[]; meta: ContentListPageMeta }>;

type UsePagedContentListArgs<T> = {
  subscribe: SubscribeFn<T>;
  fetchPage: FetchPageFn<T>;
  options: ContentSubscribeOptions;
  enabled?: boolean;
  resetKey?: string | number;
};

export function usePagedContentList<T extends { id: string }>({
  subscribe,
  fetchPage,
  options,
  enabled = true,
  resetKey = 0,
}: UsePagedContentListArgs<T>) {
  const pageSize = resolveContentListPageSize(options);
  const extraRef = useRef<T[]>([]);
  const cursorRef = useRef<ContentListCursor | null>(null);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(false);
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    if (!enabled) {
      extraRef.current = [];
      cursorRef.current = null;
      setItems([]);
      setHasMore(false);
      setLoading(false);
      setError(null);
      return;
    }

    extraRef.current = [];
    cursorRef.current = null;
    setHasMore(false);

    const unsub = subscribe(
      (live, meta) => {
        if (extraRef.current.length === 0 && meta) {
          cursorRef.current = meta.cursor;
          hasMoreRef.current = meta.hasMore;
          setHasMore(meta.hasMore);
        }
        setItems(mergeContentListPages(live, extraRef.current));
        setError(null);
        setLoading(false);
      },
      options,
      err => {
        setError(getErrorMessage(err));
        setLoading(false);
      },
    );

    return () => unsub();
  }, [enabled, options, resetKey, subscribe]);

  const loadMore = useCallback(async () => {
    if (
      !enabled ||
      pageSize == null ||
      loadingMoreRef.current ||
      !hasMoreRef.current ||
      !cursorRef.current
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const { items: next, meta } = await fetchPage({
        ...options,
        startAfter: cursorRef.current,
        pageSize,
      });
      extraRef.current = mergeContentListPages(extraRef.current, next);
      cursorRef.current = meta.cursor;
      hasMoreRef.current = meta.hasMore;
      setHasMore(meta.hasMore);
      setItems(prev => mergeContentListPages(prev, next));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [enabled, fetchPage, options, pageSize]);

  return {
    items,
    loading,
    error,
    loadMore,
    loadingMore,
    hasMore,
  };
}

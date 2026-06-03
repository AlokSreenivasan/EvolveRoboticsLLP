import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ADMIN_USERS_PAGE_SIZE,
  fetchAdminUsersPage,
} from '../../../services/firebase/adminUsersService';
import type {
  AdminUserListItem,
  AdminUsersPageCursor,
} from '../../../store/user/types/adminUsers.types';
import { getErrorMessage } from '../../../utils/firebase/errors';

const SEARCH_DEBOUNCE_MS = 350;

export function useAdminUsersList() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<AdminUsersPageCursor | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadPage = useCallback(
    async (mode: 'initial' | 'more' | 'refresh', search: string) => {
      const requestId = ++requestIdRef.current;
      const isMore = mode === 'more';

      if (isMore) {
        setLoadingMore(true);
      } else if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const result = await fetchAdminUsersPage({
          searchTerm: search,
          pageSize: ADMIN_USERS_PAGE_SIZE,
          cursor: isMore ? cursorRef.current : null,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        cursorRef.current = result.nextCursor;
        setHasMore(result.hasMore);
        setError(null);
        setUsers(prev =>
          isMore ? [...prev, ...result.users] : result.users,
        );
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setError(getErrorMessage(err));
        if (!isMore) {
          setUsers([]);
          setHasMore(false);
          cursorRef.current = null;
        }
      } finally {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    cursorRef.current = null;
    loadPage('initial', debouncedSearch);
  }, [debouncedSearch, loadPage]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || !hasMore) {
      return;
    }
    loadPage('more', debouncedSearch);
  }, [debouncedSearch, hasMore, loadPage, loading, loadingMore, refreshing]);

  const refresh = useCallback(() => {
    if (loading || refreshing) {
      return;
    }
    cursorRef.current = null;
    loadPage('refresh', debouncedSearch);
  }, [debouncedSearch, loadPage, loading, refreshing]);

  return {
    users,
    searchTerm,
    setSearchTerm,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}

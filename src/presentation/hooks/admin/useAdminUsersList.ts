import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ADMIN_USERS_PAGE_SIZE,
  fetchAdminUsersPage,
  purgeOrphanedUsers,
} from '../../../services/firebase/adminUsersService';
import type {
  AdminUserListItem,
  AdminUsersPageCursor,
} from '../../../store/user/types/adminUsers.types';
import { getErrorMessage } from '../../../utils/firebase/errors';

const SEARCH_DEBOUNCE_MS = 350;

type LoadPageFilters = {
  schoolId: string | null;
  grade: string | null;
};

export function useAdminUsersList() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<AdminUsersPageCursor | null>(null);
  const requestIdRef = useRef(0);
  const hasSyncedDeletedUsersRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadPage = useCallback(
    async (
      mode: 'initial' | 'more' | 'refresh',
      search: string,
      filters: LoadPageFilters,
    ) => {
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
        if (
          mode === 'refresh' ||
          (mode === 'initial' && !hasSyncedDeletedUsersRef.current)
        ) {
          hasSyncedDeletedUsersRef.current = true;
          try {
            await purgeOrphanedUsers();
          } catch {
            // Directory still loads if the sync function is not deployed.
          }
        }

        const result = await fetchAdminUsersPage({
          searchTerm: search,
          pageSize: ADMIN_USERS_PAGE_SIZE,
          cursor: isMore ? cursorRef.current : null,
          schoolId: filters.schoolId,
          grade: filters.grade,
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

  const activeFilters = useMemo<LoadPageFilters>(
    () => ({
      schoolId: selectedSchoolId,
      grade: selectedGrade,
    }),
    [selectedGrade, selectedSchoolId],
  );

  useEffect(() => {
    cursorRef.current = null;
    loadPage('initial', debouncedSearch, activeFilters);
  }, [activeFilters, debouncedSearch, loadPage]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || !hasMore) {
      return;
    }
    loadPage('more', debouncedSearch, activeFilters);
  }, [
    activeFilters,
    debouncedSearch,
    hasMore,
    loadPage,
    loading,
    loadingMore,
    refreshing,
  ]);

  const refresh = useCallback(async () => {
    if (loading || refreshing) {
      return;
    }
    cursorRef.current = null;
    await loadPage('refresh', debouncedSearch, activeFilters);
  }, [activeFilters, debouncedSearch, loadPage, loading, refreshing]);

  const clearFilters = useCallback(() => {
    setSelectedSchoolId(null);
    setSelectedGrade(null);
  }, []);

  const hasActiveFilters =
    selectedSchoolId !== null || selectedGrade !== null;

  return {
    users,
    searchTerm,
    setSearchTerm,
    selectedSchoolId,
    setSelectedSchoolId,
    selectedGrade,
    setSelectedGrade,
    clearFilters,
    hasActiveFilters,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}

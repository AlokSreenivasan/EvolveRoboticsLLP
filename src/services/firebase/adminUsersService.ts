import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type {
  AdminUserListFilters,
  AdminUserListItem,
  AdminUsersPageCursor,
  FetchAdminUsersPageInput,
  FetchAdminUsersPageResult,
} from '../../store/user/types/adminUsers.types';
import type { UserProfileDocument } from '../../store/user/types/user.types';
import {
  normalizeAdminUserSearchTerm,
  resolveAdminUserSearchMode,
} from '../../utils/admin/adminUserSearch';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { normalizeUserRole } from '../../utils/role/normalizeUserRole';
import { FIRESTORE_COLLECTIONS } from './constants';
import {
  collection,
  db,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from './firestoreClient';

export const ADMIN_USERS_PAGE_SIZE = 30;

function usersCollection() {
  return collection(db, FIRESTORE_COLLECTIONS.users);
}

function mapDocToListItem(
  id: string,
  data: UserProfileDocument,
): AdminUserListItem {
  const { role } = normalizeUserRole(data.role);

  return {
    uid: id,
    fullName: (data.fullName ?? '').trim(),
    email: (data.email ?? '').trim(),
    phoneNumber: (data.phoneNumber ?? '').trim(),
    role,
    schoolId: data.schoolId ?? null,
    grade: data.grade ?? null,
  };
}

function buildEqualityConstraints(filters: AdminUserListFilters) {
  const constraints: ReturnType<typeof where>[] = [];

  if (filters.schoolId) {
    constraints.push(where('schoolId', '==', filters.schoolId));
  }

  if (filters.grade) {
    constraints.push(where('grade', '==', filters.grade));
  }

  return constraints;
}

function buildRangedUsersQuery(
  field: 'fullName' | 'email' | 'phoneNumber',
  term: string,
  pageSize: number,
  cursor: AdminUsersPageCursor | null,
  filters: AdminUserListFilters,
) {
  const equalityConstraints = buildEqualityConstraints(filters);

  if (cursor) {
    return query(
      usersCollection(),
      ...equalityConstraints,
      orderBy(field),
      where(field, '>=', term),
      where(field, '<=', `${term}\uf8ff`),
      startAfter(cursor as FirebaseFirestoreTypes.QueryDocumentSnapshot),
      limit(pageSize),
    );
  }
  return query(
    usersCollection(),
    ...equalityConstraints,
    orderBy(field),
    where(field, '>=', term),
    where(field, '<=', `${term}\uf8ff`),
    limit(pageSize),
  );
}

function buildUsersListQuery(
  pageSize: number,
  searchTerm: string,
  cursor: AdminUsersPageCursor | null,
  filters: AdminUserListFilters,
) {
  const searchMode = resolveAdminUserSearchMode(searchTerm);
  const equalityConstraints = buildEqualityConstraints(filters);

  if (searchMode === 'email') {
    const emailTerm = normalizeAdminUserSearchTerm(searchTerm, 'email');
    return buildRangedUsersQuery(
      'email',
      emailTerm,
      pageSize,
      cursor,
      filters,
    );
  }

  if (searchMode === 'phone') {
    const phoneTerm = normalizeAdminUserSearchTerm(searchTerm, 'phone');
    return buildRangedUsersQuery(
      'phoneNumber',
      phoneTerm,
      pageSize,
      cursor,
      filters,
    );
  }

  if (searchMode === 'name') {
    const nameTerm = normalizeAdminUserSearchTerm(searchTerm, 'name');
    return buildRangedUsersQuery('fullName', nameTerm, pageSize, cursor, filters);
  }

  if (cursor) {
    return query(
      usersCollection(),
      ...equalityConstraints,
      orderBy('fullName'),
      startAfter(cursor as FirebaseFirestoreTypes.QueryDocumentSnapshot),
      limit(pageSize),
    );
  }

  return query(
    usersCollection(),
    ...equalityConstraints,
    orderBy('fullName'),
    limit(pageSize),
  );
}

/**
 * Paginated admin user directory. Uses cursor-based Firestore queries so lists
 * scale beyond device memory (load pages on demand via infinite scroll).
 */
export async function fetchAdminUsersPage(
  input: FetchAdminUsersPageInput = {},
): Promise<FetchAdminUsersPageResult> {
  const pageSize = input.pageSize ?? ADMIN_USERS_PAGE_SIZE;

  try {
    const listQuery = buildUsersListQuery(
      pageSize,
      input.searchTerm ?? '',
      input.cursor ?? null,
      {
        schoolId: input.schoolId ?? null,
        grade: input.grade ?? null,
      },
    );
    const snapshot = await getDocs(listQuery);
    const users = snapshot.docs.map(userDoc =>
      mapDocToListItem(
        userDoc.id,
        userDoc.data() as UserProfileDocument,
      ),
    );
    const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;
    const hasMore = snapshot.docs.length === pageSize;

    return {
      users,
      hasMore,
      nextCursor: hasMore ? lastDoc : null,
    };
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to load users.',
    );
  }
}

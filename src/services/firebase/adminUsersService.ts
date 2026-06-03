import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type {
  AdminUserListItem,
  AdminUsersPageCursor,
  FetchAdminUsersPageInput,
  FetchAdminUsersPageResult,
} from '../../store/user/types/adminUsers.types';
import type { UserProfileDocument } from '../../store/user/types/user.types';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { normalizeUserRole } from '../../utils/role/normalizeUserRole';
import { FIRESTORE_COLLECTIONS } from './constants';
import {
  collection,
  db,
  documentId,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from './firestoreClient';

export const ADMIN_USERS_PAGE_SIZE = 30;

const SEARCH_MIN_LENGTH = 2;

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
  };
}

function isEmailSearch(term: string): boolean {
  return term.includes('@');
}

function buildUsersListQuery(
  pageSize: number,
  searchTerm: string,
  cursor: AdminUsersPageCursor | null,
) {
  const trimmedSearch = searchTerm.trim();
  const useSearch = trimmedSearch.length >= SEARCH_MIN_LENGTH;

  if (useSearch && isEmailSearch(trimmedSearch)) {
    const emailTerm = trimmedSearch.toLowerCase();
    if (cursor) {
      return query(
        usersCollection(),
        orderBy('email'),
        where('email', '>=', emailTerm),
        where('email', '<=', `${emailTerm}\uf8ff`),
        orderBy(documentId()),
        startAfter(cursor as FirebaseFirestoreTypes.QueryDocumentSnapshot),
        limit(pageSize),
      );
    }
    return query(
      usersCollection(),
      orderBy('email'),
      where('email', '>=', emailTerm),
      where('email', '<=', `${emailTerm}\uf8ff`),
      orderBy(documentId()),
      limit(pageSize),
    );
  }

  if (useSearch) {
    if (cursor) {
      return query(
        usersCollection(),
        orderBy('fullName'),
        where('fullName', '>=', trimmedSearch),
        where('fullName', '<=', `${trimmedSearch}\uf8ff`),
        orderBy(documentId()),
        startAfter(cursor as FirebaseFirestoreTypes.QueryDocumentSnapshot),
        limit(pageSize),
      );
    }
    return query(
      usersCollection(),
      orderBy('fullName'),
      where('fullName', '>=', trimmedSearch),
      where('fullName', '<=', `${trimmedSearch}\uf8ff`),
      orderBy(documentId()),
      limit(pageSize),
    );
  }

  if (cursor) {
    return query(
      usersCollection(),
      orderBy('fullName'),
      orderBy(documentId()),
      startAfter(cursor as FirebaseFirestoreTypes.QueryDocumentSnapshot),
      limit(pageSize),
    );
  }

  return query(
    usersCollection(),
    orderBy('fullName'),
    orderBy(documentId()),
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

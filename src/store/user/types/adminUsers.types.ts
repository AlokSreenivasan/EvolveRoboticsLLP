import type { UserRole } from './role.types';

/** Opaque pagination cursor returned by {@link fetchAdminUsersPage}. */
export type AdminUsersPageCursor = unknown;

/** Slim user row for the admin directory (avoids holding full profiles in list state). */
export type AdminUserListItem = {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  schoolId: string | null;
  grade: string | null;
};

export type AdminUserListFilters = {
  /** When set, only users at this school are returned. */
  schoolId?: string | null;
  /** When set, only users in this grade are returned. */
  grade?: string | null;
};

export type FetchAdminUsersPageInput = {
  pageSize?: number;
  searchTerm?: string;
  cursor?: AdminUsersPageCursor | null;
} & AdminUserListFilters;

export type FetchAdminUsersPageResult = {
  users: AdminUserListItem[];
  hasMore: boolean;
  nextCursor: AdminUsersPageCursor | null;
};

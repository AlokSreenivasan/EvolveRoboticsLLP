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
};

export type FetchAdminUsersPageInput = {
  pageSize?: number;
  searchTerm?: string;
  cursor?: AdminUsersPageCursor | null;
};

export type FetchAdminUsersPageResult = {
  users: AdminUserListItem[];
  hasMore: boolean;
  nextCursor: AdminUsersPageCursor | null;
};

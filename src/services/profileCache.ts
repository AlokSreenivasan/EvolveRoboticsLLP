import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserProfile } from '../store/user/types';
import { DEFAULT_USER_ROLE, type UserRole } from '../store/user/types/role.types';
import { normalizeUserRole } from '../utils/role/normalizeUserRole';

const CACHE_KEY_PREFIX = '@evolve/profile_cache_v2';
const CACHE_UID_KEY = '@evolve/profile_cache_uid';

/** Skip blocking Firestore fetch when cache is newer than this (ms). */
export const PROFILE_CACHE_MAX_AGE_MS = 10 * 60 * 1000;

type CachedUserProfilePayload = {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  schoolId?: string | null;
  grade?: string | null;
  track?: string | null;
  role?: UserRole;
  cachedAt: number;
};

export type CachedUserProfile = {
  profile: UserProfile;
  cachedAt: number;
};

function cacheKeyForUid(uid: string): string {
  return `${CACHE_KEY_PREFIX}_${uid}`;
}

function toCachePayload(profile: UserProfile): CachedUserProfilePayload {
  return {
    uid: profile.uid,
    fullName: profile.fullName,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
    profileImage: profile.profileImage,
    schoolId: profile.schoolId,
    grade: profile.grade,
    track: profile.track,
    role: profile.role,
    cachedAt: Date.now(),
  };
}

function fromCachePayload(payload: CachedUserProfilePayload): UserProfile {
  const { role } = normalizeUserRole(payload.role ?? DEFAULT_USER_ROLE);

  return {
    uid: payload.uid,
    fullName: payload.fullName,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    profileImage: payload.profileImage,
    schoolId: payload.schoolId ?? null,
    grade: payload.grade ?? null,
    track: (payload.track as UserProfile['track']) ?? null,
    role,
    createdAt: null,
    updatedAt: null,
  };
}

export function isProfileCacheFresh(cachedAt: number): boolean {
  return Date.now() - cachedAt < PROFILE_CACHE_MAX_AGE_MS;
}

/** Reads cached profile for the given uid (optional fast hydration). */
export async function getCachedUserProfile(
  uid: string,
): Promise<CachedUserProfile | null> {
  try {
    const [cachedUid, raw] = await Promise.all([
      AsyncStorage.getItem(CACHE_UID_KEY),
      AsyncStorage.getItem(cacheKeyForUid(uid)),
    ]);

    if (cachedUid !== uid || !raw) {
      return null;
    }

    const payload = JSON.parse(raw) as CachedUserProfilePayload;
    if (payload.uid !== uid) {
      return null;
    }

    const cachedAt =
      typeof payload.cachedAt === 'number' ? payload.cachedAt : 0;

    return {
      profile: fromCachePayload(payload),
      cachedAt,
    };
  } catch {
    return null;
  }
}

export async function setCachedUserProfile(profile: UserProfile): Promise<void> {
  const payload = toCachePayload(profile);
  await Promise.all([
    AsyncStorage.setItem(CACHE_UID_KEY, profile.uid),
    AsyncStorage.setItem(cacheKeyForUid(profile.uid), JSON.stringify(payload)),
  ]);
}

export async function clearCachedUserProfile(): Promise<void> {
  try {
    const uid = await AsyncStorage.getItem(CACHE_UID_KEY);
    const removals = [AsyncStorage.removeItem(CACHE_UID_KEY)];
    if (uid) {
      removals.push(AsyncStorage.removeItem(cacheKeyForUid(uid)));
    }
    await Promise.all(removals);
  } catch {
    // Cache cleanup is best-effort.
  }
}

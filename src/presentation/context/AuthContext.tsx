import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

import { requiresEmailVerification } from '../../domain/Auth/requiresEmailVerification';
import {
  getCurrentUser,
  onAuthStateChanged,
  reloadEmailVerificationStatus,
} from '../../services/firebase/authService';
import {
  buildOptimisticProfileFromEdit,
  updateUserProfileWithSync,
} from '../../services/firebase/profileUpdateService';
import type { ProfileEditPayload } from '../../services/firebase/profileUpdateService';
import { getUserProfileWithRoleResolution } from '../../services/firebase/userService';
import {
  clearCachedUserProfile,
  getCachedUserProfile,
  isProfileCacheFresh,
  setCachedUserProfile,
} from '../../services/profileCache';
import type { UserProfile } from '../../store/user/types';
import type {
  RoleResolutionIssue,
  UserRole,
} from '../../store/user/types/role.types';
import { DEFAULT_USER_ROLE } from '../../store/user/types/role.types';
import { getErrorMessage } from '../../utils/firebase';
import {
  getRoleFromProfile,
  isAdminRole,
  isSuperAdminRole,
  roleIssueMessage,
} from '../../utils/role/normalizeUserRole';
import {
  buildFallbackUserProfile,
  isRicherUserProfile,
  resolveAvatarUri,
  resolveDisplayName,
} from '../../utils/profile/mapUserProfile';
import { isProfileComplete } from '../../domain/Profile/validation/isProfileComplete';

export interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  /** True until auth listener finishes first emission and profile hydration completes (if signed in). */
  initializing: boolean;
  profile: UserProfile | null;
  profileLoading: boolean;
  profileSaving: boolean;
  profileError: string | null;
  displayName: string;
  profileImage: string | null;
  avatarUri: string;
  /** Normalized role for the signed-in user (defaults to "user" when unsigned in). */
  role: UserRole;
  /** True while the role is being loaded from cache or Firestore after sign-in. */
  roleLoading: boolean;
  /** True when {@link role} is "admin" or "superadmin". */
  isAdmin: boolean;
  /** True when {@link role} is "superadmin". */
  isSuperAdmin: boolean;
  /** Set when role was defaulted due to missing/invalid data or a missing profile document. */
  roleIssue: RoleResolutionIssue | null;
  /** Human-readable message for {@link roleIssue}, if any. */
  roleIssueMessage: string | null;
  refreshProfile: () => Promise<void>;
  setProfileState: (profile: UserProfile | null) => void;
  /** Apply profile immediately after sign-up (before navigation). */
  establishSessionProfile: (profile: UserProfile) => void;
  updateSessionProfile: (payload: ProfileEditPayload) => Promise<boolean>;
  /**
   * True for signed-in email/password users who have not confirmed their inbox.
   * Google-only sessions are never gated.
   */
  needsEmailVerification: boolean;
  /** Reloads Auth and hydrates the session when the inbox has been confirmed. */
  completeEmailVerification: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleIssue, setRoleIssue] = useState<RoleResolutionIssue | null>(null);
  const [roleResolved, setRoleResolved] = useState(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);

  const mountedRef = useRef(true);
  const profileRef = useRef<UserProfile | null>(null);
  const hydratePromiseRef = useRef<Promise<void> | null>(null);
  const hydratedUidRef = useRef<string | null>(null);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const clearSession = useCallback(async () => {
    hydratePromiseRef.current = null;
    hydratedUidRef.current = null;
    if (!mountedRef.current) {
      return;
    }
    setProfile(null);
    setProfileError(null);
    setProfileLoading(false);
    setRoleLoading(false);
    setRoleIssue(null);
    setRoleResolved(false);
    setNeedsEmailVerification(false);
    await clearCachedUserProfile();
  }, []);

  const applyProfileIfRicher = useCallback((next: UserProfile | null) => {
    if (!mountedRef.current || !next) {
      return;
    }
    const current = profileRef.current;
    if (!isRicherUserProfile(next, current)) {
      return;
    }
    setProfile(next);
  }, []);

  const applyRoleResolution = useCallback((issue: RoleResolutionIssue | null) => {
    if (!mountedRef.current) {
      return;
    }
    setRoleIssue(issue);
    setRoleResolved(true);
    setRoleLoading(false);
  }, []);

  const applyRemoteProfile = useCallback(
    async (
      firebaseUser: FirebaseAuthTypes.User,
      remote: UserProfile | null,
      roleResolutionIssue: RoleResolutionIssue | null,
      cachedProfile: UserProfile | null,
    ) => {
      if (!mountedRef.current) {
        return;
      }

      if (remote) {
        // Firestore is source of truth — always apply so role upgrades
        // (admin / superadmin) are not blocked by equal field-score merges.
        setProfile(remote);
        await setCachedUserProfile(remote);
        applyRoleResolution(roleResolutionIssue);
        return;
      }

      let resolvedCache = cachedProfile;
      if (!resolvedCache) {
        const rechecked = await getCachedUserProfile(firebaseUser.uid);
        resolvedCache = rechecked?.profile ?? null;
      }

      if (resolvedCache) {
        applyProfileIfRicher(resolvedCache);
        applyRoleResolution('profile_document_missing');
        return;
      }

      const fallback = buildFallbackUserProfile(firebaseUser);
      applyProfileIfRicher(fallback);
      applyRoleResolution('profile_document_missing');
    },
    [applyProfileIfRicher, applyRoleResolution],
  );

  const fetchRemoteProfile = useCallback(async (uid: string) => {
    try {
      return await getUserProfileWithRoleResolution(uid);
    } catch (error) {
      if (mountedRef.current) {
        setProfileError(getErrorMessage(error));
      }
      return null;
    }
  }, []);

  const hydrateProfile = useCallback(
    async (
      firebaseUser: FirebaseAuthTypes.User,
      options?: { forceNetwork?: boolean },
    ): Promise<void> => {
      const uid = firebaseUser.uid;
      const forceNetwork = options?.forceNetwork === true;

      if (
        !forceNetwork &&
        hydratedUidRef.current === uid &&
        hydratePromiseRef.current
      ) {
        return hydratePromiseRef.current;
      }

      const existing = profileRef.current;
      if (
        !forceNetwork &&
        hydratedUidRef.current === uid &&
        existing?.uid === uid &&
        isProfileComplete(existing)
      ) {
        setProfileLoading(false);
        return;
      }

      const run = async () => {
        if (!mountedRef.current) {
          return;
        }

        setProfileError(null);
        setRoleIssue(null);
        setRoleResolved(false);
        setRoleLoading(true);

        const cached = await getCachedUserProfile(uid);
        const cachedProfile = cached?.profile ?? null;
        const cacheIsFresh =
          cached != null && isProfileCacheFresh(cached.cachedAt);

        if (cachedProfile) {
          applyProfileIfRicher(cachedProfile);
          setRoleResolved(true);
          setRoleLoading(false);
        }

        if (!forceNetwork && cacheIsFresh && isProfileComplete(cachedProfile)) {
          setProfileLoading(false);
          hydratedUidRef.current = uid;

          // Non-blocking sync so UI stays instant without stale data long-term.
          fetchRemoteProfile(uid).then(result => {
            if (!mountedRef.current || !result) {
              return;
            }
            if (result.profile) {
              setProfile(result.profile);
              setCachedUserProfile(result.profile).catch(() => undefined);
            }
            applyRoleResolution(result.roleResolution.issue ?? null);
          });

          return;
        }

        setProfileLoading(true);
        if (!cachedProfile) {
          setRoleLoading(true);
        }

        try {
          const result = await fetchRemoteProfile(uid);
          if (result) {
            await applyRemoteProfile(
              firebaseUser,
              result.profile,
              result.roleResolution.issue ?? null,
              cachedProfile,
            );
          } else if (mountedRef.current) {
            // Fetch failed — still seed a fallback so Profile/Home are not empty.
            applyProfileIfRicher(buildFallbackUserProfile(firebaseUser));
            applyRoleResolution('profile_document_missing');
          }
        } finally {
          if (mountedRef.current) {
            setProfileLoading(false);
            hydratedUidRef.current = uid;
          }
        }
      };

      hydratePromiseRef.current = run();
      return hydratePromiseRef.current;
    },
    [
      applyProfileIfRicher,
      applyRemoteProfile,
      applyRoleResolution,
      fetchRemoteProfile,
    ],
  );

  const completeEmailVerification = useCallback(async (): Promise<boolean> => {
    const verified = await reloadEmailVerificationStatus();
    if (!mountedRef.current) {
      return verified;
    }

    setNeedsEmailVerification(!verified);
    if (!verified) {
      return false;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      return false;
    }

    setUser(currentUser);
    await hydrateProfile(currentUser);
    return true;
  }, [hydrateProfile]);

  const refreshProfile = useCallback(async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      await clearSession();
      return;
    }

    hydratedUidRef.current = null;
    hydratePromiseRef.current = null;
    await hydrateProfile(currentUser, { forceNetwork: true });
  }, [clearSession, hydrateProfile]);

  const setProfileState = useCallback((next: UserProfile | null) => {
    if (!mountedRef.current) {
      return;
    }
    setProfile(next);
    if (next) {
      hydratedUidRef.current = next.uid;
      hydratePromiseRef.current = Promise.resolve();
      setProfileLoading(false);
      setRoleLoading(false);
      setRoleResolved(true);
      setRoleIssue(null);
      setCachedUserProfile(next).catch(() => undefined);
    }
  }, []);

  const establishSessionProfile = useCallback((next: UserProfile) => {
    setProfileState(next);
  }, [setProfileState]);

  const updateSessionProfile = useCallback(
    async (payload: ProfileEditPayload): Promise<boolean> => {
      if (!profile) {
        setProfileError('Profile is not loaded yet. Please try again.');
        return false;
      }

      const snapshot = profile;
      const optimistic = buildOptimisticProfileFromEdit(snapshot, payload);

      setProfile(optimistic);
      setProfileSaving(true);
      setProfileError(null);

      try {
        const updated = await updateUserProfileWithSync(snapshot, payload);
        if (!mountedRef.current) {
          return true;
        }
        setProfile(updated);
        await setCachedUserProfile(updated);
        return true;
      } catch (error) {
        if (mountedRef.current) {
          setProfile(snapshot);
          setProfileError(getErrorMessage(error));
        }
        return false;
      } finally {
        if (mountedRef.current) {
          setProfileSaving(false);
        }
      }
    },
    [profile],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async currentUser => {
      if (!mountedRef.current) {
        return;
      }

      setUser(currentUser);

      if (!currentUser) {
        await clearSession();
        setInitializing(false);
        return;
      }

      const pendingVerification = requiresEmailVerification(currentUser);
      setNeedsEmailVerification(pendingVerification);
      if (pendingVerification) {
        hydratePromiseRef.current = null;
        hydratedUidRef.current = null;
        setProfile(null);
        setProfileError(null);
        setProfileLoading(false);
        setRoleLoading(false);
        setRoleIssue(null);
        setRoleResolved(false);
        setInitializing(false);
        return;
      }

      try {
        await hydrateProfile(currentUser);
      } finally {
        if (mountedRef.current) {
          setInitializing(false);
        }
      }
    });

    return unsubscribe;
  }, [clearSession, hydrateProfile]);

  const displayName = useMemo(
    () => resolveDisplayName(profile, user),
    [profile, user],
  );

  const profileImage = useMemo(
    () => profile?.profileImage?.trim() ?? null,
    [profile],
  );

  const avatarUri = useMemo(() => resolveAvatarUri(profile), [profile]);

  const role = useMemo(
    () => (user ? getRoleFromProfile(profile) : DEFAULT_USER_ROLE),
    [profile, user],
  );

  const isAdmin = useMemo(() => isAdminRole(role), [role]);
  const isSuperAdmin = useMemo(() => isSuperAdminRole(role), [role]);

  const resolvedRoleIssueMessage = useMemo(
    () => roleIssueMessage(roleIssue),
    [roleIssue],
  );

  const effectiveRoleLoading = useMemo(
    () => Boolean(user) && (roleLoading || (!roleResolved && profileLoading)),
    [user, roleLoading, roleResolved, profileLoading],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      initializing,
      profile,
      profileLoading,
      profileSaving,
      profileError,
      displayName,
      profileImage,
      avatarUri,
      role,
      roleLoading: effectiveRoleLoading,
      isAdmin,
      isSuperAdmin,
      roleIssue,
      roleIssueMessage: resolvedRoleIssueMessage,
      refreshProfile,
      setProfileState,
      establishSessionProfile,
      updateSessionProfile,
      needsEmailVerification,
      completeEmailVerification,
    }),
    [
      user,
      initializing,
      profile,
      profileLoading,
      profileSaving,
      profileError,
      displayName,
      profileImage,
      avatarUri,
      role,
      effectiveRoleLoading,
      isAdmin,
      isSuperAdmin,
      roleIssue,
      resolvedRoleIssueMessage,
      refreshProfile,
      setProfileState,
      establishSessionProfile,
      updateSessionProfile,
      needsEmailVerification,
      completeEmailVerification,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/** Alias for session + profile consumption. */
export const useUserSession = useAuth;

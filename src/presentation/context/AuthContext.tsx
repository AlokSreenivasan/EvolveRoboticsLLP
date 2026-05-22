import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

import { onAuthStateChanged } from '../../services/firebase/authService';
import {
  buildOptimisticProfileFromEdit,
  updateUserProfileWithSync,
} from '../../services/firebase/profileUpdateService';
import type { ProfileEditPayload } from '../../services/firebase/profileUpdateService';
import { getUserProfile } from '../../services/firebase/userService';
import {
  clearCachedUserProfile,
  getCachedUserProfile,
  isProfileCacheFresh,
  setCachedUserProfile,
} from '../../services/profileCache';
import type { UserProfile } from '../../store/user/types';
import { getErrorMessage } from '../../utils/firebase';
import {
  buildFallbackUserProfile,
  resolveAvatarUri,
  resolveDisplayName,
} from '../../utils/profile/mapUserProfile';

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
  refreshProfile: () => Promise<void>;
  setProfileState: (profile: UserProfile | null) => void;
  updateSessionProfile: (payload: ProfileEditPayload) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const hydratePromiseRef = useRef<Promise<void> | null>(null);
  const hydratedUidRef = useRef<string | null>(null);

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
    await clearCachedUserProfile();
  }, []);

  const applyRemoteProfile = useCallback(
    async (
      firebaseUser: FirebaseAuthTypes.User,
      remote: UserProfile | null,
      cachedProfile: UserProfile | null,
    ) => {
      if (!mountedRef.current) {
        return;
      }

      if (remote) {
        setProfile(remote);
        await setCachedUserProfile(remote);
        return;
      }

      if (!cachedProfile) {
        setProfile(buildFallbackUserProfile(firebaseUser));
      }
    },
    [],
  );

  const fetchRemoteProfile = useCallback(
    async (uid: string): Promise<UserProfile | null> => {
      try {
        return await getUserProfile(uid);
      } catch (error) {
        if (mountedRef.current) {
          setProfileError(getErrorMessage(error));
        }
        return null;
      }
    },
    [],
  );

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

      const run = async () => {
        if (!mountedRef.current) {
          return;
        }

        setProfileError(null);

        const cached = await getCachedUserProfile(uid);
        const cachedProfile = cached?.profile ?? null;
        const cacheIsFresh =
          cached != null && isProfileCacheFresh(cached.cachedAt);

        if (cachedProfile) {
          setProfile(cachedProfile);
        }

        if (!forceNetwork && cacheIsFresh) {
          setProfileLoading(false);
          hydratedUidRef.current = uid;

          // Non-blocking sync so UI stays instant without stale data long-term.
          fetchRemoteProfile(uid).then(remote => {
            if (!mountedRef.current || !remote) {
              return;
            }
            setProfile(remote);
            setCachedUserProfile(remote).catch(() => undefined);
          });

          return;
        }

        setProfileLoading(true);

        try {
          const remote = await fetchRemoteProfile(uid);
          await applyRemoteProfile(firebaseUser, remote, cachedProfile);
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
    [applyRemoteProfile, fetchRemoteProfile],
  );

  const refreshProfile = useCallback(async () => {
    const currentUser = auth().currentUser;
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
      setCachedUserProfile(next).catch(() => undefined);
    }
  }, []);

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
      refreshProfile,
      setProfileState,
      updateSessionProfile,
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
      refreshProfile,
      setProfileState,
      updateSessionProfile,
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

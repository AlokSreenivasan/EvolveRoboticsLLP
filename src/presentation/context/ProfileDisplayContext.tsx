import { useAuth } from './AuthContext';

/**
 * Backward-compatible profile display accessors.
 * Profile data is hydrated once in AuthProvider — no per-screen Firestore calls.
 */
export function useProfileDisplay() {
  const {
    displayName,
    profileImage,
    refreshProfile,
    profileLoading,
  } = useAuth();

  return {
    displayName,
    /** Remote Firebase Storage URL when available. */
    photoUri: profileImage,
    profileImage,
    profileLoading,
    refreshProfile,
    /**
     * @deprecated Profile updates go through Firestore via useProfileForm.persistProfile.
     */
    setDisplayName: async (_name: string) => {
      await refreshProfile();
    },
    /**
     * @deprecated Profile updates go through Firestore via useProfileForm.persistProfile.
     */
    setProfilePhotoUri: async (_uri: string | null) => {
      await refreshProfile();
    },
  };
}

/** @deprecated AuthProvider now owns profile hydration app-wide. */
export function ProfileDisplayProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

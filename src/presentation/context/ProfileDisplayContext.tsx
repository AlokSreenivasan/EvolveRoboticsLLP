import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getProfileFullName,
  getProfilePhotoUri,
  saveProfileFullName,
  saveProfilePhotoUri,
} from '../../services/profileStorage';

const DEFAULT_DISPLAY_NAME = 'Sarah Woods';

type ProfileDisplayContextType = {
  displayName: string;
  photoUri: string | null;
  setDisplayName: (name: string) => Promise<void>;
  setProfilePhotoUri: (uri: string | null) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const ProfileDisplayContext = createContext<ProfileDisplayContextType | null>(
  null,
);

export function ProfileDisplayProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [displayName, setDisplayNameState] = useState(DEFAULT_DISPLAY_NAME);
  const [photoUri, setPhotoUriState] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    const [storedName, storedPhoto] = await Promise.all([
      getProfileFullName(),
      getProfilePhotoUri(),
    ]);
    setDisplayNameState(storedName ?? DEFAULT_DISPLAY_NAME);
    setPhotoUriState(storedPhoto);
  }, []);

  const setDisplayName = useCallback(async (name: string) => {
    const trimmed = name.trim();
    await saveProfileFullName(trimmed);
    setDisplayNameState(trimmed || DEFAULT_DISPLAY_NAME);
  }, []);

  const setProfilePhotoUri = useCallback(async (uri: string | null) => {
    await saveProfilePhotoUri(uri);
    setPhotoUriState(uri?.trim() ? uri.trim() : null);
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const value = useMemo(
    () => ({
      displayName,
      photoUri,
      setDisplayName,
      setProfilePhotoUri,
      refreshProfile,
    }),
    [displayName, photoUri, setDisplayName, setProfilePhotoUri, refreshProfile],
  );

  return (
    <ProfileDisplayContext.Provider value={value}>
      {children}
    </ProfileDisplayContext.Provider>
  );
}

export function useProfileDisplay() {
  const context = useContext(ProfileDisplayContext);
  if (!context) {
    throw new Error(
      'useProfileDisplay must be used within ProfileDisplayProvider',
    );
  }
  return context;
}

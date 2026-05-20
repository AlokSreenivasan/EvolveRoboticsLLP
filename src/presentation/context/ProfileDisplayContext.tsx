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
  saveProfileFullName,
} from '../../services/profileStorage';

const DEFAULT_DISPLAY_NAME = 'Sarah Woods';

type ProfileDisplayContextType = {
  displayName: string;
  setDisplayName: (name: string) => Promise<void>;
  refreshDisplayName: () => Promise<void>;
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

  const refreshDisplayName = useCallback(async () => {
    const stored = await getProfileFullName();
    setDisplayNameState(stored ?? DEFAULT_DISPLAY_NAME);
  }, []);

  const setDisplayName = useCallback(async (name: string) => {
    const trimmed = name.trim();
    await saveProfileFullName(trimmed);
    setDisplayNameState(trimmed || DEFAULT_DISPLAY_NAME);
  }, []);

  useEffect(() => {
    refreshDisplayName();
  }, [refreshDisplayName]);

  const value = useMemo(
    () => ({ displayName, setDisplayName, refreshDisplayName }),
    [displayName, setDisplayName, refreshDisplayName],
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

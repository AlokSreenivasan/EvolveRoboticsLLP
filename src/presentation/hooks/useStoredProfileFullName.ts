import { useAuth } from '../context/AuthContext';

/** Display name from centralized session state (no extra Firestore fetch). */
export function useStoredProfileFullName(): string {
  const { displayName } = useAuth();
  return displayName;
}

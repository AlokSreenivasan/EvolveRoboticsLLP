import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferenceKey,
  type NotificationPreferences,
} from '../constants/notificationPreferences';
import { loadNotificationPreferencesFromFirestore } from './firebase/notificationPreferencesFirestoreService';

const NOTIFICATION_PREFERENCES_KEY = '@evolve/notification_preferences';

export async function loadNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
    if (!raw) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    }

    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
}

export async function saveNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<void> {
  await AsyncStorage.setItem(
    NOTIFICATION_PREFERENCES_KEY,
    JSON.stringify(preferences),
  );
}

export async function updateNotificationPreference(
  key: NotificationPreferenceKey,
  value: boolean,
): Promise<NotificationPreferences> {
  const current = await loadNotificationPreferences();
  const next = { ...current, [key]: value };
  await saveNotificationPreferences(next);
  return next;
}

export async function resetNotificationPreferences(): Promise<NotificationPreferences> {
  const defaults = { ...DEFAULT_NOTIFICATION_PREFERENCES };
  await saveNotificationPreferences(defaults);
  return defaults;
}

/**
 * Loads remote preferences for a signed-in user and keeps local storage in sync.
 */
export async function hydrateNotificationPreferences(
  uid: string,
): Promise<NotificationPreferences> {
  const remote = await loadNotificationPreferencesFromFirestore(uid);
  if (!remote) {
    return loadNotificationPreferences();
  }

  await saveNotificationPreferences(remote);
  return remote;
}

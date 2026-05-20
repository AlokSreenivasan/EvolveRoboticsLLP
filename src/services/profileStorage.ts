import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_FULL_NAME_KEY = '@evolve/profile_full_name';

export async function getProfileFullName(): Promise<string | null> {
  const value = await AsyncStorage.getItem(PROFILE_FULL_NAME_KEY);
  return value?.trim() ? value : null;
}

export async function saveProfileFullName(fullName: string): Promise<void> {
  const trimmed = fullName.trim();
  if (!trimmed) {
    await AsyncStorage.removeItem(PROFILE_FULL_NAME_KEY);
    return;
  }
  await AsyncStorage.setItem(PROFILE_FULL_NAME_KEY, trimmed);
}

/** Clears stored profile name — useful for dev/testing. */
export async function clearProfileFullName(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_FULL_NAME_KEY);
}

import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_FULL_NAME_KEY = '@evolve/profile_full_name';
const PROFILE_PHOTO_URI_KEY = '@evolve/profile_photo_uri';
const PROFILE_CONTACT_NUMBER_KEY = '@evolve/profile_contact_number';

export const DEFAULT_PROFILE_AVATAR_URI =
  'https://randomuser.me/api/portraits/women/44.jpg';

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

export async function getProfilePhotoUri(): Promise<string | null> {
  const value = await AsyncStorage.getItem(PROFILE_PHOTO_URI_KEY);
  return value?.trim() ? value : null;
}

export async function saveProfilePhotoUri(uri: string | null): Promise<void> {
  if (!uri?.trim()) {
    await AsyncStorage.removeItem(PROFILE_PHOTO_URI_KEY);
    return;
  }
  await AsyncStorage.setItem(PROFILE_PHOTO_URI_KEY, uri.trim());
}

/** Clears stored profile name — useful for dev/testing. */
export async function clearProfileFullName(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_FULL_NAME_KEY);
}

export async function getProfileContactNumber(): Promise<string | null> {
  const value = await AsyncStorage.getItem(PROFILE_CONTACT_NUMBER_KEY);
  return value?.trim() ? value : null;
}

export async function saveProfileContactNumber(
  contactNumber: string,
): Promise<void> {
  const trimmed = contactNumber.trim();
  if (!trimmed) {
    await AsyncStorage.removeItem(PROFILE_CONTACT_NUMBER_KEY);
    return;
  }
  await AsyncStorage.setItem(PROFILE_CONTACT_NUMBER_KEY, trimmed);
}

/** Clears stored profile photo — useful for dev/testing. */
export async function clearProfilePhotoUri(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_PHOTO_URI_KEY);
}

/** Clears stored contact number — useful for dev/testing. */
export async function clearProfileContactNumber(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_CONTACT_NUMBER_KEY);
}

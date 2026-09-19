import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = '@evolve/birthday_wish_year:';

function keyForUid(uid: string): string {
  return `${KEY_PREFIX}${uid}`;
}

export async function getBirthdayWishShownYear(
  uid: string,
): Promise<number | null> {
  if (!uid) {
    return null;
  }

  const raw = await AsyncStorage.getItem(keyForUid(uid));
  if (!raw) {
    return null;
  }

  const year = Number(raw);
  return Number.isInteger(year) ? year : null;
}

export async function markBirthdayWishShown(
  uid: string,
  year: number,
): Promise<void> {
  if (!uid || !Number.isInteger(year)) {
    return;
  }

  await AsyncStorage.setItem(keyForUid(uid), String(year));
}

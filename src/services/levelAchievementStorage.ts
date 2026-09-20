import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = '@evolve/acknowledged_learner_level:';

function keyForUid(uid: string): string {
  return `${KEY_PREFIX}${uid}`;
}

export async function getAcknowledgedLearnerLevel(
  uid: string,
): Promise<number | null> {
  if (!uid) {
    return null;
  }

  const raw = await AsyncStorage.getItem(keyForUid(uid));
  if (!raw) {
    return null;
  }

  const level = Number(raw);
  return Number.isInteger(level) && level >= 1 ? level : null;
}

export async function markAcknowledgedLearnerLevel(
  uid: string,
  level: number,
): Promise<void> {
  if (!uid || !Number.isInteger(level) || level < 1) {
    return;
  }

  await AsyncStorage.setItem(keyForUid(uid), String(level));
}

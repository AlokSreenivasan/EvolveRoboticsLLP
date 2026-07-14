import { getFunctions, httpsCallable } from '@react-native-firebase/functions';

import { wrapFirebaseError } from '../../utils/firebase/errors';

export type MigrateAnswerKeysResult = {
  examsMigrated: number;
  quizzesMigrated: number;
};

/** Admin-only: move embedded answer keys into private collections. */
export async function migrateAnswerKeys(): Promise<MigrateAnswerKeysResult> {
  try {
    const callable = httpsCallable<void, MigrateAnswerKeysResult>(
      getFunctions(),
      'migrateAnswerKeys',
    );
    const response = await callable();
    return {
      examsMigrated:
        typeof response.data?.examsMigrated === 'number'
          ? response.data.examsMigrated
          : 0,
      quizzesMigrated:
        typeof response.data?.quizzesMigrated === 'number'
          ? response.data.quizzesMigrated
          : 0,
    };
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to migrate answer keys.',
    );
  }
}

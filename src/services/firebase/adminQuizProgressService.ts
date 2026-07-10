import { wrapFirebaseError } from '../../utils/firebase/errors';
import { FIRESTORE_COLLECTIONS } from './constants';
import { collection, db, deleteDoc, getDocs } from './firestoreClient';

const QUIZ_ATTEMPTS_SUBCOLLECTION = 'quizAttempts';

export async function resetUserQuizProgress(
  targetUserId: string,
): Promise<{ deletedCount: number }> {
  const uid = targetUserId.trim();
  if (!uid) {
    throw new Error('User id is required.');
  }

  try {
    const attemptsRef = collection(
      db,
      FIRESTORE_COLLECTIONS.users,
      uid,
      QUIZ_ATTEMPTS_SUBCOLLECTION,
    );
    const snapshot = await getDocs(attemptsRef);

    if (snapshot.empty) {
      return { deletedCount: 0 };
    }

    await Promise.all(
      snapshot.docs.map(attemptDoc => deleteDoc(attemptDoc.ref)),
    );

    return { deletedCount: snapshot.size };
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to reset quiz progress.',
    );
  }
}

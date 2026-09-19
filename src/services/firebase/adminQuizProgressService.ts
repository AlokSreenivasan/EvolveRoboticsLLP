import { wrapFirebaseError } from '../../utils/firebase/errors';
import { FIRESTORE_COLLECTIONS } from './constants';
import { collection, db, deleteDoc, getDocs } from './firestoreClient';

const QUIZ_ATTEMPTS_SUBCOLLECTION = 'quizAttempts';
const CONTINUE_LEARNING_PROGRESS_SUBCOLLECTION = 'continueLearningProgress';

async function deleteSubcollectionDocs(
  uid: string,
  subcollection: string,
): Promise<number> {
  const snapshot = await getDocs(
    collection(db, FIRESTORE_COLLECTIONS.users, uid, subcollection),
  );

  if (snapshot.empty) {
    return 0;
  }

  await Promise.all(snapshot.docs.map(itemDoc => deleteDoc(itemDoc.ref)));
  return snapshot.size;
}

/**
 * Clears quiz attempts and lesson progress so derived XP, level, and daily
 * missions all restart from zero.
 */
export async function resetUserQuizProgress(
  targetUserId: string,
): Promise<{ deletedCount: number }> {
  const uid = targetUserId.trim();
  if (!uid) {
    throw new Error('User id is required.');
  }

  try {
    const [deletedQuizAttempts, deletedLessonProgress] = await Promise.all([
      deleteSubcollectionDocs(uid, QUIZ_ATTEMPTS_SUBCOLLECTION),
      deleteSubcollectionDocs(uid, CONTINUE_LEARNING_PROGRESS_SUBCOLLECTION),
    ]);

    return { deletedCount: deletedQuizAttempts + deletedLessonProgress };
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to reset quiz progress.',
    );
  }
}

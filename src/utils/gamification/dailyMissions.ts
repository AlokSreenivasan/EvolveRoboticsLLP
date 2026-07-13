import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { ContinueLearningProgress } from '../../store/content/types/continueLearningProgress.types';
import type { QuizAttempt } from '../../services/firebase/quizAttemptsService';

export const DAILY_MISSION_LESSONS_XP = 20;
export const DAILY_MISSION_QUIZ_XP = 30;

function isTimestampToday(
  timestamp: FirebaseFirestoreTypes.Timestamp | null | undefined,
): boolean {
  if (!timestamp) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const value = timestamp.toDate();
  value.setHours(0, 0, 0, 0);
  return value.getTime() === today.getTime();
}

export function isLessonsMissionCompleteToday(
  progressRecords: ContinueLearningProgress[],
): boolean {
  return progressRecords.some(
    record =>
      isTimestampToday(record.updatedAt) &&
      (record.hasStartedWatching || record.videosWatched > 0),
  );
}

export function isQuizMissionCompleteToday(attempts: QuizAttempt[]): boolean {
  return attempts.some(attempt => isTimestampToday(attempt.submittedAt));
}

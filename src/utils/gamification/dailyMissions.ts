import type { ContinueLearningProgress } from '../../store/content/types/continueLearningProgress.types';
import type { QuizAttempt } from '../../services/firebase/quizAttemptsService';
import { VIDEO_UNLOCK_WATCH_SECONDS } from '../continueLearning/formatVideoProgress';
import {
  formatDateKey,
  isTimestampOnDateKey,
} from './gamificationDates';

/** XP for maintaining a daily learning streak (any activity). */
export const DAILY_STREAK_ACTIVITY_XP = 10;
/** XP for watching a lesson video on a given day. */
export const DAILY_MISSION_LESSONS_XP = 20;
/** XP for completing any quiz on a given day. */
export const DAILY_MISSION_QUIZ_XP = 30;


function hasVideoWatchActivityOnDate(
  progressRecords: ContinueLearningProgress[],
  dateKey: string,
): boolean {
  return progressRecords.some(record => {
    if (!isTimestampOnDateKey(record.updatedAt, dateKey)) {
      return false;
    }

    if (record.hasStartedWatching || record.videosWatched > 0) {
      return true;
    }

    return Object.values(record.watchSecondsByVideoId).some(
      seconds => seconds >= VIDEO_UNLOCK_WATCH_SECONDS,
    );
  });
}

function hasQuizActivityOnDate(
  attempts: QuizAttempt[],
  dateKey: string,
): boolean {
  return attempts.some(attempt => isTimestampOnDateKey(attempt.submittedAt, dateKey));
}

function hasAnyLearningActivityOnDate(
  progressRecords: ContinueLearningProgress[],
  attempts: QuizAttempt[],
  dateKey: string,
): boolean {
  return (
    progressRecords.some(record =>
      isTimestampOnDateKey(record.updatedAt, dateKey),
    ) || hasQuizActivityOnDate(attempts, dateKey)
  );
}

export function collectLearningActivityDateKeys(
  progressRecords: ContinueLearningProgress[],
  attempts: QuizAttempt[],
): Set<string> {
  const dateKeys = new Set<string>();

  for (const record of progressRecords) {
    if (record.updatedAt) {
      dateKeys.add(formatDateKey(record.updatedAt.toDate()));
    }
  }

  for (const attempt of attempts) {
    if (attempt.submittedAt) {
      dateKeys.add(formatDateKey(attempt.submittedAt.toDate()));
    }
  }

  return dateKeys;
}

export function isLessonsMissionCompleteToday(
  progressRecords: ContinueLearningProgress[],
): boolean {
  const todayKey = formatDateKey(new Date());
  return hasVideoWatchActivityOnDate(progressRecords, todayKey);
}

export function isQuizMissionCompleteToday(attempts: QuizAttempt[]): boolean {
  const todayKey = formatDateKey(new Date());
  return hasQuizActivityOnDate(attempts, todayKey);
}

/** XP earned from daily streak activity and missions on a single calendar day. */
export function computeDailyStreakXpForDate(
  dateKey: string,
  progressRecords: ContinueLearningProgress[],
  attempts: QuizAttempt[],
): number {
  let xp = 0;

  if (hasAnyLearningActivityOnDate(progressRecords, attempts, dateKey)) {
    xp += DAILY_STREAK_ACTIVITY_XP;
  }
  if (hasVideoWatchActivityOnDate(progressRecords, dateKey)) {
    xp += DAILY_MISSION_LESSONS_XP;
  }
  if (hasQuizActivityOnDate(attempts, dateKey)) {
    xp += DAILY_MISSION_QUIZ_XP;
  }

  return xp;
}

/** Total XP earned from all daily streak days and completed missions. */
export function computeTotalDailyStreakXp(
  progressRecords: ContinueLearningProgress[],
  attempts: QuizAttempt[],
): number {
  const dateKeys = collectLearningActivityDateKeys(progressRecords, attempts);
  let total = 0;

  for (const dateKey of dateKeys) {
    total += computeDailyStreakXpForDate(dateKey, progressRecords, attempts);
  }

  return total;
}

import type { ContinueLearningProgress } from '../../store/content/types/continueLearningProgress.types';
import type { QuizAttempt } from '../../services/firebase/quizAttemptsService';
import { isPerfectQuizScore } from '../quizAccess';
import { computeTotalDailyStreakXp } from './dailyMissions';
import { formatDateKey } from './gamificationDates';

/** Default XP reward for quizzes without an admin-set value. */
export const XP_PER_QUIZ = 20;
export const XP_LEVEL_SIZE = 100;

/** XP earned from a quiz attempt — only awarded on a perfect (100%) score. */
export function computeQuizXpEarned(
  xpValue: number,
  correctCount: number,
  totalQuestions: number,
): number {
  const total = Math.max(0, Math.trunc(totalQuestions));
  const correct = Math.max(0, Math.min(Math.trunc(correctCount), total));
  const maxXp = Math.max(0, Math.trunc(xpValue));
  if (total === 0 || maxXp === 0 || correct !== total) {
    return 0;
  }
  return maxXp;
}

export type UserStreakStats = {
  currentXp: number;
  level: number;
  totalXp: number;
  streakDays: number;
};

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function computeStreakDays(activityDates: Set<string>): number {
  if (activityDates.size === 0) {
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cursor = new Date(today);
  const todayKey = formatDateKey(today);

  if (!activityDates.has(todayKey)) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (activityDates.has(formatDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function computeQuizXpTotal(quizAttempts: QuizAttempt[]): number {
  return quizAttempts.reduce((sum, attempt) => {
    if (!isPerfectQuizScore(attempt)) {
      return sum;
    }
    return (
      sum +
      (typeof attempt.xpEarned === 'number' && attempt.xpEarned > 0
        ? attempt.xpEarned
        : 0)
    );
  }, 0);
}

export function computeUserStreakStats(
  progressRecords: ContinueLearningProgress[],
  quizAttempts: QuizAttempt[],
): UserStreakStats {
  const quizXp = computeQuizXpTotal(quizAttempts);
  const dailyStreakXp = computeTotalDailyStreakXp(
    progressRecords,
    quizAttempts,
  );
  const totalXp = quizXp + dailyStreakXp;
  const level = Math.floor(totalXp / XP_LEVEL_SIZE) + 1;
  const currentXp = totalXp % XP_LEVEL_SIZE;

  const activityDates = new Set<string>();
  for (const record of progressRecords) {
    if (record.updatedAt) {
      activityDates.add(formatDateKey(record.updatedAt.toDate()));
    }
  }
  for (const attempt of quizAttempts) {
    if (attempt.submittedAt) {
      activityDates.add(formatDateKey(attempt.submittedAt.toDate()));
    }
  }

  return {
    currentXp,
    level,
    totalXp,
    streakDays: computeStreakDays(activityDates),
  };
}

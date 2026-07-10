import type { ContinueLearningProgress } from '../../store/content/types/continueLearningProgress.types';
import type { QuizAttempt } from '../../services/firebase/quizAttemptsService';

export const XP_PER_VIDEO = 5;
export const XP_PER_QUIZ = 20;
export const XP_LEVEL_SIZE = 100;

export type UserStreakStats = {
  currentXp: number;
  level: number;
  totalXp: number;
  streakDays: number;
};

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

export function computeUserStreakStats(
  progressRecords: ContinueLearningProgress[],
  quizAttempts: QuizAttempt[],
): UserStreakStats {
  const totalVideos = progressRecords.reduce(
    (sum, record) => sum + record.videosWatched,
    0,
  );
  const totalXp = totalVideos * XP_PER_VIDEO + quizAttempts.length * XP_PER_QUIZ;
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

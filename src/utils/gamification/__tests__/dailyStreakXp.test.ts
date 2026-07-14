import type { ContinueLearningProgress } from '../../store/content/types/continueLearningProgress.types';
import type { QuizAttempt } from '../../services/firebase/quizAttemptsService';
import { computeUserStreakStats } from '../computeUserStreakStats';
import {
  DAILY_MISSION_LESSONS_XP,
  DAILY_MISSION_QUIZ_XP,
  DAILY_STREAK_ACTIVITY_XP,
  computeDailyStreakXpForDate,
  computeTotalDailyStreakXp,
} from '../dailyMissions';
import { formatDateKey } from '../gamificationDates';

function timestampForDate(year: number, month: number, day: number) {
  const date = new Date(year, month, day, 12, 0, 0, 0);
  return {
    toDate: () => date,
  };
}

function makeProgress(
  overrides: Partial<ContinueLearningProgress> = {},
): ContinueLearningProgress {
  return {
    playlistId: 'playlist-1',
    videosWatched: 0,
    hasStartedWatching: false,
    watchSecondsByVideoId: {},
    updatedAt: null,
    ...overrides,
  };
}

function makeQuizAttempt(overrides: Partial<QuizAttempt> = {}): QuizAttempt {
  return {
    quizId: 'quiz-1',
    answers: {},
    correctCount: 0,
    totalQuestions: 5,
    percentage: 0,
    xpEarned: 0,
    submittedAt: null,
    ...overrides,
  };
}

describe('daily streak XP', () => {
  const activityDateKey = '2026-07-10';

  it('awards activity XP when user watches a video', () => {
    const progress = [
      makeProgress({
        hasStartedWatching: true,
        videosWatched: 1,
        updatedAt: timestampForDate(2026, 6, 10),
      }),
    ];

    expect(
      computeDailyStreakXpForDate(activityDateKey, progress, []),
    ).toBe(DAILY_STREAK_ACTIVITY_XP + DAILY_MISSION_LESSONS_XP);
  });

  it('awards activity XP when user completes a quiz mission', () => {
    const attempts = [
      makeQuizAttempt({
        submittedAt: timestampForDate(2026, 6, 10),
      }),
    ];

    expect(
      computeDailyStreakXpForDate(activityDateKey, [], attempts),
    ).toBe(DAILY_STREAK_ACTIVITY_XP + DAILY_MISSION_QUIZ_XP);
  });

  it('stacks video, quiz, and activity XP on the same day', () => {
    const progress = [
      makeProgress({
        hasStartedWatching: true,
        videosWatched: 2,
        updatedAt: timestampForDate(2026, 6, 10),
      }),
    ];
    const attempts = [
      makeQuizAttempt({
        submittedAt: timestampForDate(2026, 6, 10),
      }),
    ];

    expect(computeTotalDailyStreakXp(progress, attempts)).toBe(
      DAILY_STREAK_ACTIVITY_XP +
        DAILY_MISSION_LESSONS_XP +
        DAILY_MISSION_QUIZ_XP,
    );
  });

  it('includes daily streak XP in total user XP', () => {
    const today = new Date();
    const todayKey = formatDateKey(today);
    const progress = [
      makeProgress({
        hasStartedWatching: true,
        videosWatched: 1,
        updatedAt: {
          toDate: () => today,
        },
      }),
    ];
    const attempts = [
      makeQuizAttempt({
        correctCount: 5,
        totalQuestions: 5,
        percentage: 100,
        xpEarned: 20,
        submittedAt: {
          toDate: () => today,
        },
      }),
    ];

    const stats = computeUserStreakStats(progress, attempts);
    const expectedDailyXp = computeDailyStreakXpForDate(
      todayKey,
      progress,
      attempts,
    );

    expect(stats.totalXp).toBe(20 + expectedDailyXp);
    expect(stats.streakDays).toBeGreaterThanOrEqual(1);
  });
});

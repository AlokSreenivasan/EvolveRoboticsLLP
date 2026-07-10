import type { QuizAttempt } from '../services/firebase/quizAttemptsService';
import type { QuizCompetition } from '../store/content/types/quizCompetitions.types';

export type QuizAccessStatus = 'available' | 'locked' | 'completed' | 'retryable';

export function getQuizAccessStatus(
  quiz: QuizCompetition,
  index: number,
  quizzes: QuizCompetition[],
  completedQuizIds: Set<string>,
): QuizAccessStatus {
  if (completedQuizIds.has(quiz.id)) {
    return quiz.allowRetry ? 'retryable' : 'completed';
  }

  if (index === 0) {
    return 'available';
  }

  const previousQuiz = quizzes[index - 1];
  if (previousQuiz && completedQuizIds.has(previousQuiz.id)) {
    return 'available';
  }

  return 'locked';
}

export function canAttemptQuiz(
  quizId: string,
  quizzes: QuizCompetition[],
  completedQuizIds: Set<string>,
): boolean {
  const index = quizzes.findIndex(quiz => quiz.id === quizId);
  if (index < 0) {
    return false;
  }

  const status = getQuizAccessStatus(
    quizzes[index],
    index,
    quizzes,
    completedQuizIds,
  );

  return status === 'available' || status === 'retryable';
}

export function getQuizAttempt(
  quizId: string,
  attemptByQuizId: Map<string, QuizAttempt>,
): QuizAttempt | undefined {
  return attemptByQuizId.get(quizId);
}

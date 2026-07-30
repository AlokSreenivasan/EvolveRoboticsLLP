import type { QuizAttempt } from '../../services/firebase/quizAttemptsService';
import type { QuizCompetition } from '../../store/content/types/quizCompetitions.types';
import {
  canAttemptQuiz,
  canRetryQuizAttempt,
  getQuizAccessStatus,
  isPerfectQuizScore,
} from '../quizAccess';

function makeAttempt(
  overrides: Partial<QuizAttempt> & Pick<QuizAttempt, 'quizId'>,
): QuizAttempt {
  return {
    id: overrides.quizId,
    quizId: overrides.quizId,
    answers: {},
    correctCount: overrides.correctCount ?? 0,
    totalQuestions: overrides.totalQuestions ?? 5,
    percentage: overrides.percentage ?? 0,
    xpEarned: overrides.xpEarned ?? 0,
    submittedAt: null,
  };
}

function makeQuiz(
  id: string,
  allowRetry = false,
): QuizCompetition {
  return {
    id,
    title: id,
    description: '',
    timerSeconds: 60,
    xpValue: 20,
    allowRetry,
    questions: [],
    track: null,
    sortOrder: 0,
    isPublished: true,
    createdAt: null,
    updatedAt: null,
    audience: 'all',
    schoolIds: [],
    schoolGradeIds: {},
  };
}

describe('isPerfectQuizScore', () => {
  it('requires all questions correct and a non-zero total', () => {
    expect(
      isPerfectQuizScore(makeAttempt({ quizId: 'q1', correctCount: 5, totalQuestions: 5 })),
    ).toBe(true);
    expect(
      isPerfectQuizScore(makeAttempt({ quizId: 'q1', correctCount: 4, totalQuestions: 5 })),
    ).toBe(false);
    expect(
      isPerfectQuizScore(makeAttempt({ quizId: 'q1', correctCount: 0, totalQuestions: 0 })),
    ).toBe(false);
  });
});

describe('canRetryQuizAttempt', () => {
  it('allows retry after an imperfect score', () => {
    expect(
      canRetryQuizAttempt(
        makeAttempt({ quizId: 'q1', correctCount: 3, totalQuestions: 5 }),
      ),
    ).toBe(true);
  });

  it('blocks retry after a perfect score when allowRetry is off', () => {
    expect(
      canRetryQuizAttempt(
        makeAttempt({ quizId: 'q1', correctCount: 5, totalQuestions: 5 }),
        false,
      ),
    ).toBe(false);
  });

  it('allows retry after a perfect score when allowRetry is on', () => {
    expect(
      canRetryQuizAttempt(
        makeAttempt({ quizId: 'q1', correctCount: 5, totalQuestions: 5 }),
        true,
      ),
    ).toBe(true);
  });

  it('returns false when there is no attempt', () => {
    expect(canRetryQuizAttempt(undefined, true)).toBe(false);
  });
});

describe('getQuizAccessStatus', () => {
  const quizzes = [
    makeQuiz('q1'),
    makeQuiz('q2', true),
    makeQuiz('q3'),
  ];

  it('marks the first quiz available and later quizzes locked when fresh', () => {
    const completed = new Set<string>();
    const attempts = new Map<string, QuizAttempt>();

    expect(getQuizAccessStatus(quizzes[0], 0, quizzes, completed, attempts)).toBe(
      'available',
    );
    expect(getQuizAccessStatus(quizzes[1], 1, quizzes, completed, attempts)).toBe(
      'locked',
    );
  });

  it('marks imperfect attempts retryable and keeps the next quiz locked', () => {
    const completed = new Set(['q1']);
    const attempts = new Map([
      [
        'q1',
        makeAttempt({ quizId: 'q1', correctCount: 2, totalQuestions: 5 }),
      ],
    ]);

    expect(getQuizAccessStatus(quizzes[0], 0, quizzes, completed, attempts)).toBe(
      'retryable',
    );
    expect(getQuizAccessStatus(quizzes[1], 1, quizzes, completed, attempts)).toBe(
      'locked',
    );
  });

  it('marks perfect attempts completed and unlocks the next quiz', () => {
    const completed = new Set(['q1']);
    const attempts = new Map([
      [
        'q1',
        makeAttempt({ quizId: 'q1', correctCount: 5, totalQuestions: 5 }),
      ],
    ]);

    expect(getQuizAccessStatus(quizzes[0], 0, quizzes, completed, attempts)).toBe(
      'completed',
    );
    expect(getQuizAccessStatus(quizzes[1], 1, quizzes, completed, attempts)).toBe(
      'available',
    );
  });

  it('keeps perfect attempts retryable when the quiz allows retry', () => {
    const completed = new Set(['q2']);
    const attempts = new Map([
      [
        'q2',
        makeAttempt({ quizId: 'q2', correctCount: 5, totalQuestions: 5 }),
      ],
    ]);

    expect(getQuizAccessStatus(quizzes[1], 1, quizzes, completed, attempts)).toBe(
      'retryable',
    );
  });
});

describe('canAttemptQuiz', () => {
  const quizzes = [makeQuiz('q1', true), makeQuiz('q2')];

  it('allows starting available and retryable quizzes only', () => {
    const completed = new Set(['q1']);
    const attempts = new Map([
      [
        'q1',
        makeAttempt({ quizId: 'q1', correctCount: 5, totalQuestions: 5 }),
      ],
    ]);

    expect(canAttemptQuiz('q1', quizzes, completed, attempts)).toBe(true);
    expect(canAttemptQuiz('q2', quizzes, completed, attempts)).toBe(true);
    expect(canAttemptQuiz('missing', quizzes, completed, attempts)).toBe(false);
  });
});

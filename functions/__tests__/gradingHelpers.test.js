const {
  DEFAULT_QUIZ_XP,
  isAdminRole,
  normalizeChoiceIndex,
  normalizeAnswersMap,
  extractQuestions,
  resolveAnswerKey,
  gradeAnswers,
  computeQuizXpEarned,
  stripQuestionsForPublic,
  extractAnswerKeyFromQuestions,
  questionHasEmbeddedKey,
} = require('../gradingHelpers');

describe('isAdminRole', () => {
  it('accepts admin and superadmin only', () => {
    expect(isAdminRole('admin')).toBe(true);
    expect(isAdminRole('superadmin')).toBe(true);
    expect(isAdminRole('user')).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole('ADMIN')).toBe(false);
  });
});

describe('normalizeChoiceIndex', () => {
  it('accepts integers 0-3', () => {
    expect(normalizeChoiceIndex(0)).toBe(0);
    expect(normalizeChoiceIndex(3)).toBe(3);
  });

  it('truncates fractional values', () => {
    expect(normalizeChoiceIndex(2.9)).toBe(2);
  });

  it('rejects out-of-range and non-numeric values', () => {
    expect(normalizeChoiceIndex(-1)).toBeNull();
    expect(normalizeChoiceIndex(4)).toBeNull();
    expect(normalizeChoiceIndex(NaN)).toBeNull();
    expect(normalizeChoiceIndex(Infinity)).toBeNull();
    expect(normalizeChoiceIndex('2')).toBeNull();
    expect(normalizeChoiceIndex(null)).toBeNull();
  });
});

describe('normalizeAnswersMap', () => {
  it('normalizes a valid answers map and trims question ids', () => {
    expect(normalizeAnswersMap({ ' q1 ': 1, q2: 3 })).toEqual({ q1: 1, q2: 3 });
  });

  it('rejects non-object input', () => {
    expect(normalizeAnswersMap(null)).toBeNull();
    expect(normalizeAnswersMap([1, 2])).toBeNull();
    expect(normalizeAnswersMap('q1')).toBeNull();
  });

  it('rejects invalid choice values and blank keys', () => {
    expect(normalizeAnswersMap({ q1: 5 })).toBeNull();
    expect(normalizeAnswersMap({ '  ': 1 })).toBeNull();
  });

  it('rejects maps with more than 500 entries', () => {
    const big = Object.fromEntries(
      Array.from({ length: 501 }, (_, i) => [`q${i}`, 0]),
    );
    expect(normalizeAnswersMap(big)).toBeNull();
  });
});

describe('extractQuestions', () => {
  it('filters out questions without a valid id', () => {
    const data = {
      questions: [
        { id: 'q1', prompt: 'A?' },
        { id: '', prompt: 'bad' },
        null,
        { prompt: 'no id' },
      ],
    };
    expect(extractQuestions(data, 'doc1')).toEqual([{ id: 'q1', prompt: 'A?' }]);
  });

  it('builds a legacy single question from prompt/choices', () => {
    const data = {
      prompt: 'Legacy?',
      choices: ['a', 'b', 'c', 'd'],
      correctChoiceIndex: 2,
    };
    expect(extractQuestions(data, 'quiz9')).toEqual([
      {
        id: 'quiz9_legacy_q1',
        prompt: 'Legacy?',
        choices: ['a', 'b', 'c', 'd'],
        correctChoiceIndex: 2,
      },
    ]);
  });

  it('returns empty for legacy docs with fewer than 4 choices', () => {
    expect(extractQuestions({ prompt: 'x', choices: ['a'] }, 'd')).toEqual([]);
    expect(extractQuestions({}, 'd')).toEqual([]);
  });
});

describe('resolveAnswerKey', () => {
  const questions = [
    { id: 'q1', correctChoiceIndex: 1 },
    { id: 'q2' },
  ];

  it('prefers the stored answer-key document', () => {
    const key = resolveAnswerKey(
      questions,
      { byQuestionId: { q1: 3, q2: 0 } },
      null,
      'doc',
    );
    expect(key).toEqual({ q1: 3, q2: 0 });
  });

  it('falls back to embedded correctChoiceIndex per question', () => {
    expect(resolveAnswerKey(questions, null, null, 'doc')).toEqual({ q1: 1 });
  });

  it('falls back to legacy root-level key for single-question docs', () => {
    const legacyQuestions = [{ id: 'q1' }];
    const key = resolveAnswerKey(
      legacyQuestions,
      null,
      { correctChoiceIndex: 2 },
      'doc',
    );
    expect(key).toEqual({ q1: 2 });
  });

  it('ignores invalid entries in the stored key', () => {
    const key = resolveAnswerKey(
      [{ id: 'q1' }],
      { byQuestionId: { q1: 9 } },
      null,
      'doc',
    );
    expect(key).toEqual({});
  });
});

describe('gradeAnswers', () => {
  const questions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }];
  const key = { q1: 0, q2: 1, q3: 2 };

  it('counts correct answers and computes a rounded percentage', () => {
    const result = gradeAnswers(questions, { q1: 0, q2: 1, q3: 3 }, key);
    expect(result).toEqual({ correctCount: 2, totalQuestions: 3, percentage: 67 });
  });

  it('treats missing answers as incorrect', () => {
    const result = gradeAnswers(questions, {}, key);
    expect(result).toEqual({ correctCount: 0, totalQuestions: 3, percentage: 0 });
  });

  it('skips questions missing from the answer key', () => {
    const result = gradeAnswers(questions, { q1: 0, q2: 1, q3: 2 }, { q1: 0 });
    expect(result).toEqual({ correctCount: 1, totalQuestions: 3, percentage: 33 });
  });

  it('handles zero questions without dividing by zero', () => {
    expect(gradeAnswers([], {}, {})).toEqual({
      correctCount: 0,
      totalQuestions: 0,
      percentage: 0,
    });
  });
});

describe('computeQuizXpEarned', () => {
  it('awards full XP only for a perfect score', () => {
    expect(computeQuizXpEarned(DEFAULT_QUIZ_XP, 5, 5)).toBe(DEFAULT_QUIZ_XP);
    expect(computeQuizXpEarned(DEFAULT_QUIZ_XP, 4, 5)).toBe(0);
  });

  it('returns 0 for zero XP value or zero questions', () => {
    expect(computeQuizXpEarned(0, 5, 5)).toBe(0);
    expect(computeQuizXpEarned(20, 0, 0)).toBe(0);
  });

  it('clamps negative and fractional inputs', () => {
    expect(computeQuizXpEarned(20.9, 3, 3)).toBe(20);
    expect(computeQuizXpEarned(-5, 3, 3)).toBe(0);
  });
});

describe('stripQuestionsForPublic', () => {
  it('removes answer keys from question objects', () => {
    const stripped = stripQuestionsForPublic([
      { id: 'q1', prompt: 'A?', choices: ['x'], correctChoiceIndex: 2 },
    ]);
    expect(stripped).toEqual([{ id: 'q1', prompt: 'A?', choices: ['x'] }]);
    expect(stripped[0]).not.toHaveProperty('correctChoiceIndex');
  });
});

describe('extractAnswerKeyFromQuestions', () => {
  it('collects embedded keys by question id', () => {
    const key = extractAnswerKeyFromQuestions(
      [
        { id: 'q1', correctChoiceIndex: 1 },
        { id: 'q2', correctChoiceIndex: 9 },
      ],
      null,
      'doc',
    );
    expect(key).toEqual({ q1: 1 });
  });

  it('uses the legacy root key when no embedded keys exist', () => {
    const key = extractAnswerKeyFromQuestions(
      [{ id: 'q1' }],
      { correctChoiceIndex: 3 },
      'doc',
    );
    expect(key).toEqual({ q1: 3 });
  });

  it('uses the legacy doc id when there are no questions', () => {
    const key = extractAnswerKeyFromQuestions(
      [],
      { correctChoiceIndex: 0 },
      'quiz7',
    );
    expect(key).toEqual({ quiz7_legacy_q1: 0 });
  });
});

describe('questionHasEmbeddedKey', () => {
  it('detects a valid embedded key', () => {
    expect(questionHasEmbeddedKey({ correctChoiceIndex: 0 })).toBe(true);
    expect(questionHasEmbeddedKey({ correctChoiceIndex: 7 })).toBe(false);
    expect(questionHasEmbeddedKey({})).toBe(false);
    expect(questionHasEmbeddedKey(null)).toBe(false);
  });
});

/**
 * Pure helpers for exam/quiz grading and answer-key handling.
 * Extracted from index.js so they can be unit-tested without firebase-admin.
 */

const DEFAULT_QUIZ_XP = 20;

function isAdminRole(role) {
  return role === 'admin' || role === 'superadmin';
}

function normalizeChoiceIndex(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  const truncated = Math.trunc(value);
  if (truncated < 0 || truncated > 3) {
    return null;
  }
  return truncated;
}

function normalizeAnswersMap(raw) {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const answers = {};
  const entries = Object.entries(raw);
  if (entries.length > 500) {
    return null;
  }

  for (const [questionId, value] of entries) {
    if (typeof questionId !== 'string' || !questionId.trim()) {
      return null;
    }
    const choiceIndex = normalizeChoiceIndex(value);
    if (choiceIndex == null) {
      return null;
    }
    answers[questionId.trim()] = choiceIndex;
  }

  return answers;
}

function extractQuestions(data, docId) {
  if (Array.isArray(data?.questions) && data.questions.length > 0) {
    return data.questions.filter(
      question => question && typeof question.id === 'string' && question.id.trim(),
    );
  }

  // Legacy single-question quiz docs.
  const prompt = typeof data?.prompt === 'string' ? data.prompt.trim() : '';
  const choices = Array.isArray(data?.choices) ? data.choices : [];
  if (!prompt || choices.length < 4) {
    return [];
  }

  return [
    {
      id: `${docId}_legacy_q1`,
      prompt,
      choices,
      correctChoiceIndex: data?.correctChoiceIndex,
    },
  ];
}

function resolveAnswerKey(questions, answerKeyData, contentData, _docId) {
  const byQuestionId = {};

  if (
    answerKeyData?.byQuestionId != null &&
    typeof answerKeyData.byQuestionId === 'object' &&
    !Array.isArray(answerKeyData.byQuestionId)
  ) {
    for (const [questionId, value] of Object.entries(answerKeyData.byQuestionId)) {
      const index = normalizeChoiceIndex(value);
      if (typeof questionId === 'string' && questionId.trim() && index != null) {
        byQuestionId[questionId.trim()] = index;
      }
    }
  }

  for (const question of questions) {
    const id = question.id.trim();
    if (byQuestionId[id] != null) {
      continue;
    }
    const fromQuestion = normalizeChoiceIndex(question.correctChoiceIndex);
    if (fromQuestion != null) {
      byQuestionId[id] = fromQuestion;
    }
  }

  // Legacy root-level key on old quiz docs.
  if (
    Object.keys(byQuestionId).length === 0 &&
    questions.length === 1 &&
    contentData
  ) {
    const legacy = normalizeChoiceIndex(contentData.correctChoiceIndex);
    if (legacy != null) {
      byQuestionId[questions[0].id.trim()] = legacy;
    }
  }

  return byQuestionId;
}

function gradeAnswers(questions, answers, byQuestionId) {
  const totalQuestions = questions.length;
  let correctCount = 0;

  for (const question of questions) {
    const questionId = question.id.trim();
    const expected = byQuestionId[questionId];
    if (typeof expected !== 'number') {
      continue;
    }
    if (answers[questionId] === expected) {
      correctCount += 1;
    }
  }

  const percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return { correctCount, totalQuestions, percentage };
}

function computeQuizXpEarned(xpValue, correctCount, totalQuestions) {
  const total = Math.max(0, Math.trunc(totalQuestions));
  const correct = Math.max(0, Math.min(Math.trunc(correctCount), total));
  const maxXp = Math.max(0, Math.trunc(xpValue));
  if (total === 0 || maxXp === 0 || correct !== total) {
    return 0;
  }
  return maxXp;
}

function stripQuestionsForPublic(questions) {
  return questions.map(question => ({
    id: question.id,
    prompt: question.prompt,
    choices: question.choices,
  }));
}

function extractAnswerKeyFromQuestions(questions, contentData, docId) {
  const byQuestionId = {};
  for (const question of questions) {
    const id =
      typeof question?.id === 'string' ? question.id.trim() : `${docId}_legacy_q1`;
    const index = normalizeChoiceIndex(question?.correctChoiceIndex);
    if (index != null) {
      byQuestionId[id] = index;
    }
  }

  if (
    Object.keys(byQuestionId).length === 0 &&
    questions.length <= 1 &&
    contentData
  ) {
    const legacy = normalizeChoiceIndex(contentData.correctChoiceIndex);
    const questionId =
      questions[0]?.id?.trim?.() || `${docId}_legacy_q1`;
    if (legacy != null) {
      byQuestionId[questionId] = legacy;
    }
  }

  return byQuestionId;
}

function questionHasEmbeddedKey(question) {
  return normalizeChoiceIndex(question?.correctChoiceIndex) != null;
}

module.exports = {
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
};

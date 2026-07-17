import type { ExamQuestion } from '../../store/content/types/exams.types';

export type AnswerKeyDocument = {
  byQuestionId: Record<string, number>;
};

export function normalizeCorrectChoiceIndex(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(3, Math.max(0, Math.trunc(value)));
}

/** Public question shape persisted on exams / quizCompetitions (no answer key). */
export function stripQuestionsForPublic(
  questions: ExamQuestion[],
): Array<Omit<ExamQuestion, 'correctChoiceIndex'>> {
  return questions.map(question => ({
    id: question.id,
    prompt: question.prompt,
    choices: question.choices,
  }));
}

export function extractAnswerKey(
  questions: ExamQuestion[],
): Record<string, number> {
  const byQuestionId: Record<string, number> = {};
  for (const question of questions) {
    const id = typeof question.id === 'string' ? question.id.trim() : '';
    if (!id) {
      continue;
    }
    byQuestionId[id] = normalizeCorrectChoiceIndex(question.correctChoiceIndex);
  }
  return byQuestionId;
}

export function stripCorrectChoiceFromQuestions(
  questions: ExamQuestion[],
): ExamQuestion[] {
  return questions.map(question => {
    const rest = { ...question };
    delete rest.correctChoiceIndex;
    return rest;
  });
}

export function mergeAnswerKeyIntoQuestions(
  questions: ExamQuestion[],
  byQuestionId: Record<string, number> | null | undefined,
): ExamQuestion[] {
  if (byQuestionId == null) {
    return stripCorrectChoiceFromQuestions(questions);
  }

  return questions.map(question => {
    const id = typeof question.id === 'string' ? question.id.trim() : '';
    const fromKey =
      id.length > 0 && typeof byQuestionId[id] === 'number'
        ? byQuestionId[id]
        : undefined;

    if (fromKey != null) {
      return {
        ...question,
        correctChoiceIndex: normalizeCorrectChoiceIndex(fromKey),
      };
    }

    const rest = { ...question };
    delete rest.correctChoiceIndex;
    return rest;
  });
}

export function mapAnswerKeyDocument(
  data: unknown,
): Record<string, number> | null {
  if (data == null || typeof data !== 'object') {
    return null;
  }
  const raw = (data as AnswerKeyDocument).byQuestionId;
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const byQuestionId: Record<string, number> = {};
  for (const [questionId, value] of Object.entries(raw)) {
    if (typeof questionId !== 'string' || !questionId.trim()) {
      continue;
    }
    byQuestionId[questionId.trim()] = normalizeCorrectChoiceIndex(value);
  }
  return byQuestionId;
}

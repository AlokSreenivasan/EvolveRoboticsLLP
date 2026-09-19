import type { ExamChoice, ExamQuestion } from '../../store/content/types/exams.types';
import { isLocalImageUri } from '../profile/mapUserProfile';
import { uploadExamQuestionImage } from '../../services/firebase/storageService';

export function trimOptionalImageUrl(
  url: string | null | undefined,
): string | undefined {
  const trimmed = url?.trim();
  return trimmed ? trimmed : undefined;
}

export function questionHasPromptContent(question: {
  prompt?: string;
  imageUrl?: string;
}): boolean {
  return Boolean(question.prompt?.trim() || question.imageUrl?.trim());
}

export function choiceHasContent(choice: {
  text?: string;
  imageUrl?: string;
}): boolean {
  return Boolean(choice.text?.trim() || choice.imageUrl?.trim());
}

export function collectExamImageUrls(
  questions: ExamQuestion[] | null | undefined,
): string[] {
  const urls: string[] = [];
  for (const question of questions ?? []) {
    const promptImage = trimOptionalImageUrl(question.imageUrl);
    if (promptImage) {
      urls.push(promptImage);
    }
    for (const choice of question.choices ?? []) {
      const choiceImage = trimOptionalImageUrl(choice.imageUrl);
      if (choiceImage) {
        urls.push(choiceImage);
      }
    }
  }
  return urls;
}

function withOptionalImageUrl<T extends { imageUrl?: string }>(
  item: T,
  imageUrl: string | undefined,
): T {
  if (!imageUrl) {
    return item;
  }
  return { ...item, imageUrl };
}

async function persistImageUrl(
  examId: string,
  slotId: string,
  imageUrl: string | undefined,
): Promise<string | undefined> {
  const trimmed = trimOptionalImageUrl(imageUrl);
  if (!trimmed) {
    return undefined;
  }
  if (!isLocalImageUri(trimmed)) {
    return trimmed;
  }
  return uploadExamQuestionImage(examId, slotId, trimmed);
}

export async function persistExamQuestionImages(
  examId: string,
  questions: ExamQuestion[],
): Promise<ExamQuestion[]> {
  const next: ExamQuestion[] = [];

  for (const question of questions) {
    const promptImageUrl = await persistImageUrl(
      examId,
      `${question.id}_prompt`,
      question.imageUrl,
    );

    const choices = (await Promise.all(
      question.choices.map(async (choice, index) => {
        const choiceImageUrl = await persistImageUrl(
          examId,
          choice.id || `${question.id}_${index}`,
          choice.imageUrl,
        );
        const mapped: ExamChoice = {
          id: choice.id,
          text: choice.text,
        };
        return withOptionalImageUrl(mapped, choiceImageUrl);
      }),
    )) as ExamQuestion['choices'];

    const mapped: ExamQuestion = {
      id: question.id,
      prompt: question.prompt,
      choices,
      ...(question.correctChoiceIndex != null
        ? { correctChoiceIndex: question.correctChoiceIndex }
        : {}),
    };

    next.push(withOptionalImageUrl(mapped, promptImageUrl));
  }

  return next;
}

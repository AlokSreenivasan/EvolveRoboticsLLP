import type { ExamQuestion } from '../../../store/content/types/exams.types';
import { stripQuestionsForPublic } from '../answerKeys';
import {
  choiceHasContent,
  collectExamImageUrls,
  questionHasPromptContent,
} from '../questionMedia';

const sampleQuestion = (): ExamQuestion => ({
  id: 'q1',
  prompt: 'What is force?',
  imageUrl: 'https://example.com/q.png',
  choices: [
    { id: 'q1_a', text: 'Newton', imageUrl: 'https://example.com/a.png' },
    { id: 'q1_b', text: 'Joule' },
    { id: 'q1_c', text: '', imageUrl: 'https://example.com/c.png' },
    { id: 'q1_d', text: 'Watt' },
  ],
  correctChoiceIndex: 0,
});

describe('stripQuestionsForPublic', () => {
  it('keeps prompt and choice images and drops the answer key', () => {
    const stripped = stripQuestionsForPublic([sampleQuestion()]);
    expect(stripped).toEqual([
      {
        id: 'q1',
        prompt: 'What is force?',
        imageUrl: 'https://example.com/q.png',
        choices: [
          { id: 'q1_a', text: 'Newton', imageUrl: 'https://example.com/a.png' },
          { id: 'q1_b', text: 'Joule' },
          { id: 'q1_c', text: '', imageUrl: 'https://example.com/c.png' },
          { id: 'q1_d', text: 'Watt' },
        ],
      },
    ]);
    expect(stripped[0]).not.toHaveProperty('correctChoiceIndex');
  });
});

describe('question media helpers', () => {
  it('treats image-only prompts and choices as complete', () => {
    expect(
      questionHasPromptContent({ prompt: '', imageUrl: 'https://img' }),
    ).toBe(true);
    expect(questionHasPromptContent({ prompt: 'Text', imageUrl: '' })).toBe(
      true,
    );
    expect(questionHasPromptContent({ prompt: ' ', imageUrl: '' })).toBe(false);
    expect(choiceHasContent({ text: '', imageUrl: 'https://img' })).toBe(true);
    expect(choiceHasContent({ text: 'A', imageUrl: '' })).toBe(true);
    expect(choiceHasContent({ text: ' ', imageUrl: '' })).toBe(false);
  });

  it('collects prompt and choice image URLs', () => {
    expect(collectExamImageUrls([sampleQuestion()])).toEqual([
      'https://example.com/q.png',
      'https://example.com/a.png',
      'https://example.com/c.png',
    ]);
  });
});

import {
  computeMovedChatKeywordIds,
  findChatKeywordResponse,
} from '../chatKeywordsService';
import type { ChatKeyword } from '../../../store/content/types/chatKeywords.types';

function keyword(
  id: string,
  label: string,
  response: string,
  sortOrder = 0,
): ChatKeyword {
  return {
    id,
    label,
    response,
    sortOrder,
    isPublished: true,
    createdAt: null,
    updatedAt: null,
  };
}

describe('findChatKeywordResponse', () => {
  const keywords = [
    keyword('1', 'Courses', 'Browse available courses.'),
    keyword('2', 'Help', '  How can I assist?  '),
    keyword('3', 'Empty', '   '),
  ];

  it('matches a keyword label case-insensitively', () => {
    expect(findChatKeywordResponse(keywords, 'courses')).toBe(
      'Browse available courses.',
    );
    expect(findChatKeywordResponse(keywords, '  HELP  ')).toBe(
      'How can I assist?',
    );
  });

  it('returns null when there is no matching label', () => {
    expect(findChatKeywordResponse(keywords, 'unknown')).toBeNull();
  });

  it('returns null for blank user messages', () => {
    expect(findChatKeywordResponse(keywords, '   ')).toBeNull();
  });

  it('returns null when the matched keyword has an empty response', () => {
    expect(findChatKeywordResponse(keywords, 'Empty')).toBeNull();
  });
});

describe('computeMovedChatKeywordIds', () => {
  const keywords = [
    keyword('a', 'A', 'a', 0),
    keyword('b', 'B', 'b', 1),
    keyword('c', 'C', 'c', 2),
  ];

  it('moves a keyword up by swapping with the previous item', () => {
    expect(computeMovedChatKeywordIds('b', 'up', keywords)).toEqual([
      'b',
      'a',
      'c',
    ]);
  });

  it('moves a keyword down by swapping with the next item', () => {
    expect(computeMovedChatKeywordIds('b', 'down', keywords)).toEqual([
      'a',
      'c',
      'b',
    ]);
  });

  it('returns null at the top when moving up', () => {
    expect(computeMovedChatKeywordIds('a', 'up', keywords)).toBeNull();
  });

  it('returns null at the bottom when moving down', () => {
    expect(computeMovedChatKeywordIds('c', 'down', keywords)).toBeNull();
  });

  it('returns null for unknown keyword ids', () => {
    expect(computeMovedChatKeywordIds('missing', 'up', keywords)).toBeNull();
  });
});

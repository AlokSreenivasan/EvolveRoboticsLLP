import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from '../../../config/support';
import {
  computeMovedChatKeywordIds,
  filterChatKeywordsByQuery,
  findChatKeywordResponse,
  findRelatedChatKeywords,
  getStarterChatKeywords,
  MATCHED_CHAT_SUPPORT_NOTE,
  resolveAssistantReply,
  UNMATCHED_CHAT_REPLY,
  withMatchedSupportNote,
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

  it('matches a keyword label contained in a longer message', () => {
    expect(findChatKeywordResponse(keywords, 'Show me courses please')).toBe(
      'Browse available courses.',
    );
  });

  it('matches a typed prefix of a keyword label', () => {
    expect(findChatKeywordResponse(keywords, 'cour')).toBe(
      'Browse available courses.',
    );
  });
});

describe('getStarterChatKeywords', () => {
  it('returns the first usable keywords up to the limit', () => {
    const keywords = [
      keyword('1', 'Courses', 'Browse available courses.', 0),
      keyword('2', 'Empty', '   ', 1),
      keyword('3', 'Help', 'How can I assist?', 2),
      keyword('4', 'Events', 'See upcoming events.', 3),
    ];

    expect(getStarterChatKeywords(keywords, 2).map(item => item.id)).toEqual([
      '1',
      '3',
    ]);
  });
});

describe('filterChatKeywordsByQuery', () => {
  const keywords = [
    keyword('1', 'Courses', 'Browse available courses.'),
    keyword('2', 'Help', 'How can I assist?'),
  ];

  it('returns all keywords when the query is too short', () => {
    expect(filterChatKeywordsByQuery(keywords, 'c')).toEqual(keywords);
  });

  it('filters keywords by label', () => {
    expect(filterChatKeywordsByQuery(keywords, 'hel').map(item => item.id)).toEqual(
      ['2'],
    );
  });
});

describe('findRelatedChatKeywords', () => {
  const keywords = [
    keyword('1', 'Courses', 'Browse available courses.'),
    keyword('2', 'Help', 'How can I assist?'),
    keyword('3', 'Events', 'See upcoming events.'),
  ];

  it('returns keywords whose labels share a word with the message', () => {
    expect(
      findRelatedChatKeywords(keywords, 'I need help with homework').map(
        item => item.id,
      ),
    ).toEqual(['2']);
  });

  it('falls back to starters when nothing is related', () => {
    expect(
      findRelatedChatKeywords(keywords, 'zzzz', 2).map(item => item.id),
    ).toEqual(['1', '2']);
  });
});

describe('resolveAssistantReply', () => {
  const keywords = [
    keyword('1', 'Courses', 'Browse available courses.'),
    keyword('2', 'Empty', '   '),
  ];

  it('uses the explicit keyword response for quick options without support details', () => {
    expect(
      resolveAssistantReply(keywords, 'Courses', 'Browse available courses.'),
    ).toBe('Browse available courses.');
  });

  it('falls back to label matching when no explicit response is passed', () => {
    expect(resolveAssistantReply(keywords, 'courses')).toBe(
      withMatchedSupportNote('Browse available courses.'),
    );
  });

  it('asks the user to contact support if a typed match is not enough', () => {
    const reply = resolveAssistantReply(keywords, 'courses');
    expect(reply.startsWith('Browse available courses.')).toBe(true);
    expect(reply).toContain(MATCHED_CHAT_SUPPORT_NOTE);
    expect(reply).toContain(SUPPORT_PHONE);
    expect(reply).toContain(SUPPORT_EMAIL);
  });

  it('does not add support details when a keyword chip is selected', () => {
    expect(
      resolveAssistantReply(keywords, 'Courses', 'Browse available courses.'),
    ).not.toContain(MATCHED_CHAT_SUPPORT_NOTE);
  });

  it('returns a fallback when a quick option has a blank response', () => {
    expect(resolveAssistantReply(keywords, 'Empty', '   ')).toBe(
      UNMATCHED_CHAT_REPLY,
    );
  });

  it('returns a fallback when the typed message does not match', () => {
    expect(resolveAssistantReply(keywords, 'unknown')).toBe(UNMATCHED_CHAT_REPLY);
  });

  it('includes support phone and email in the unmatched reply', () => {
    expect(UNMATCHED_CHAT_REPLY).toContain(SUPPORT_PHONE);
    expect(UNMATCHED_CHAT_REPLY).toContain(SUPPORT_EMAIL);
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

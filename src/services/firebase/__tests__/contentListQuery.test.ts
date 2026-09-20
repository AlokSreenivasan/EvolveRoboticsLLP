import {
  buildSortedContentListQuery,
  mergeContentListPages,
  resolveContentListPageSize,
  LEARNER_CONTENT_PAGE_SIZE,
} from '../contentListQuery';
import { limit, orderBy, query, startAfter, where } from '../firestoreClient';

jest.mock('../firestoreClient', () => ({
  query: jest.fn((ref, ...constraints) => ({ ref, constraints })),
  where: jest.fn((field, op, value) => ({ type: 'where', field, op, value })),
  orderBy: jest.fn((field, direction) => ({
    type: 'orderBy',
    field,
    direction,
  })),
  limit: jest.fn(count => ({ type: 'limit', count })),
  startAfter: jest.fn(cursor => ({ type: 'startAfter', cursor })),
}));

const collectionRef = { path: 'courses' };

describe('resolveContentListPageSize', () => {
  it('caps learner lists at the default page size', () => {
    expect(resolveContentListPageSize()).toBe(LEARNER_CONTENT_PAGE_SIZE);
  });

  it('does not cap admin unpublished lists', () => {
    expect(resolveContentListPageSize({ includeUnpublished: true })).toBe(
      undefined,
    );
  });

  it('does not cap unbounded learner queries', () => {
    expect(resolveContentListPageSize({ unbounded: true })).toBe(undefined);
  });
});

describe('buildSortedContentListQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses published + sortOrder + limit for learners', () => {
    buildSortedContentListQuery(collectionRef as never);

    expect(where).toHaveBeenCalledWith('isPublished', '==', true);
    expect(orderBy).toHaveBeenCalledWith('sortOrder', 'asc');
    expect(limit).toHaveBeenCalledWith(LEARNER_CONTENT_PAGE_SIZE);
    expect(query).toHaveBeenCalled();
  });

  it('omits the published filter and limit for admins', () => {
    buildSortedContentListQuery(collectionRef as never, {
      includeUnpublished: true,
    });

    expect(where).not.toHaveBeenCalled();
    expect(orderBy).toHaveBeenCalledWith('sortOrder', 'asc');
    expect(limit).not.toHaveBeenCalled();
  });

  it('forwards startAfter for the next page', () => {
    const cursor = { id: 'last' };
    buildSortedContentListQuery(collectionRef as never, {
      startAfter: cursor,
      pageSize: 10,
    });

    expect(startAfter).toHaveBeenCalledWith(cursor);
    expect(limit).toHaveBeenCalledWith(10);
  });
});

describe('mergeContentListPages', () => {
  it('appends extras without duplicating live ids', () => {
    expect(
      mergeContentListPages(
        [{ id: 'a' }, { id: 'b' }],
        [{ id: 'b' }, { id: 'c' }],
      ),
    ).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
  });
});

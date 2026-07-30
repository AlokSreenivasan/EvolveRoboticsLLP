import { computeMovedSchoolIds } from '../schoolsService';
import type { School } from '../../../store/content/types/schools.types';

function school(id: string, sortOrder: number): School {
  return {
    id,
    name: id,
    city: '',
    sortOrder,
    grades: [],
    createdAt: null,
    updatedAt: null,
  };
}

describe('computeMovedSchoolIds', () => {
  it('moves a school up by swapping with the previous item', () => {
    const schools = [school('a', 0), school('b', 1), school('c', 2)];
    expect(computeMovedSchoolIds('b', 'up', schools)).toEqual(['b', 'a', 'c']);
  });

  it('moves a school down by swapping with the next item', () => {
    const schools = [school('a', 0), school('b', 1), school('c', 2)];
    expect(computeMovedSchoolIds('b', 'down', schools)).toEqual([
      'a',
      'c',
      'b',
    ]);
  });

  it('returns null at the top when moving up', () => {
    const schools = [school('a', 0), school('b', 1)];
    expect(computeMovedSchoolIds('a', 'up', schools)).toBeNull();
  });

  it('returns null at the bottom when moving down', () => {
    const schools = [school('a', 0), school('b', 1)];
    expect(computeMovedSchoolIds('b', 'down', schools)).toBeNull();
  });

  it('returns null for unknown school ids', () => {
    const schools = [school('a', 0)];
    expect(computeMovedSchoolIds('missing', 'up', schools)).toBeNull();
  });
});

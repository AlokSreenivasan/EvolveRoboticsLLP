import { getLearnerRank } from '../learnerRank';

describe('getLearnerRank', () => {
  it('maps the learner rank bands', () => {
    expect(getLearnerRank(1)).toBe('Explorer');
    expect(getLearnerRank(3)).toBe('Explorer');
    expect(getLearnerRank(4)).toBe('Builder');
    expect(getLearnerRank(7)).toBe('Builder');
    expect(getLearnerRank(8)).toBe('Innovator');
    expect(getLearnerRank(12)).toBe('Innovator');
    expect(getLearnerRank(13)).toBe('Roboticist');
    expect(getLearnerRank(18)).toBe('Roboticist');
    expect(getLearnerRank(19)).toBe('Master');
    expect(getLearnerRank(23)).toBe('Master');
    expect(getLearnerRank(24)).toBe('Pioneer');
    expect(getLearnerRank(30)).toBe('Pioneer');
  });
});

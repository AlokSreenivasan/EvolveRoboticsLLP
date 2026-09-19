import {
  ageOnDate,
  firstNameFromDisplayName,
  isBirthdayToday,
} from '../birthdayWish';

describe('birthdayWish', () => {
  it('matches day and month, ignoring year', () => {
    const asOf = new Date(2026, 8, 18);
    expect(isBirthdayToday('18/09/2014', asOf)).toBe(true);
    expect(isBirthdayToday('19/09/2014', asOf)).toBe(false);
    expect(isBirthdayToday('18/08/2014', asOf)).toBe(false);
  });

  it('skips missing or invalid dates of birth', () => {
    const asOf = new Date(2026, 8, 18);
    expect(isBirthdayToday(null, asOf)).toBe(false);
    expect(isBirthdayToday('2014-09-18', asOf)).toBe(false);
  });

  it('observes 29 Feb on 28 Feb in non-leap years', () => {
    expect(isBirthdayToday('29/02/2016', new Date(2026, 1, 28))).toBe(true);
    expect(isBirthdayToday('29/02/2016', new Date(2026, 1, 27))).toBe(false);
    expect(isBirthdayToday('29/02/2016', new Date(2028, 1, 29))).toBe(true);
    expect(isBirthdayToday('29/02/2016', new Date(2028, 1, 28))).toBe(false);
  });

  it('returns age on the birthday as the year just turned', () => {
    expect(ageOnDate('18/09/2014', new Date(2026, 8, 18))).toBe(12);
    expect(ageOnDate('19/09/2014', new Date(2026, 8, 18))).toBe(11);
  });

  it('counts a Feb 29 birthday as reached on Feb 28 in non-leap years', () => {
    expect(ageOnDate('29/02/2016', new Date(2026, 1, 27))).toBe(9);
    expect(ageOnDate('29/02/2016', new Date(2026, 1, 28))).toBe(10);
  });

  it('uses the first word of the display name', () => {
    expect(firstNameFromDisplayName('Aisha Kumar')).toBe('Aisha');
    expect(firstNameFromDisplayName('  Rohan  ')).toBe('Rohan');
    expect(firstNameFromDisplayName('')).toBe('Learner');
    expect(firstNameFromDisplayName(null)).toBe('Learner');
  });
});

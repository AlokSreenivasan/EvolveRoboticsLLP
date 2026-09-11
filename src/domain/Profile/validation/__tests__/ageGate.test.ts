import {
  birthYearOptions,
  isUnder13,
  isValidBirthYear,
  maxAllowedBirthYear,
  minAllowedBirthYear,
  needsParentalConsent,
} from '../ageGate';

const asOf = new Date('2026-09-11T00:00:00Z');

describe('ageGate', () => {
  it('accepts birth years between 4 and 80 years ago', () => {
    expect(minAllowedBirthYear(asOf)).toBe(1946);
    expect(maxAllowedBirthYear(asOf)).toBe(2022);
    expect(isValidBirthYear(2014, asOf)).toBe(true);
    expect(isValidBirthYear(2023, asOf)).toBe(false);
    expect(isValidBirthYear(1945, asOf)).toBe(false);
    expect(isValidBirthYear(2014.5, asOf)).toBe(false);
    expect(isValidBirthYear(null, asOf)).toBe(false);
  });

  it('lists years newest first', () => {
    const years = birthYearOptions(asOf);
    expect(years[0]).toBe(2022);
    expect(years[years.length - 1]).toBe(1946);
  });

  it('treats calendar age under 13 as under-13', () => {
    expect(isUnder13(2014, asOf)).toBe(true);
    expect(isUnder13(2013, asOf)).toBe(false);
    expect(isUnder13(2008, asOf)).toBe(false);
    expect(isUnder13(null, asOf)).toBe(false);
  });

  it('requires parental consent only for under-13 without a recorded timestamp', () => {
    expect(needsParentalConsent(2014, null, asOf)).toBe(true);
    expect(needsParentalConsent(2014, 1, asOf)).toBe(false);
    expect(needsParentalConsent(2010, null, asOf)).toBe(false);
  });
});

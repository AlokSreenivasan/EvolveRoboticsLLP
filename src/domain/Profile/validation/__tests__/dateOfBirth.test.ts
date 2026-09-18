import {
  birthYearFromDateOfBirth,
  formatDateOfBirth,
  formatDateOfBirthParts,
  isValidDateOfBirth,
  parseDateOfBirth,
  resolveWritableDateOfBirth,
} from '../dateOfBirth';

const asOf = new Date('2026-09-18T00:00:00Z');

describe('dateOfBirth', () => {
  it('formats and parses DD/MM/YYYY', () => {
    expect(formatDateOfBirth(new Date(2014, 2, 9))).toBe('09/03/2014');
    expect(parseDateOfBirth('09/03/2014')?.getFullYear()).toBe(2014);
    expect(parseDateOfBirth('09/03/2014')?.getMonth()).toBe(2);
    expect(parseDateOfBirth('09/03/2014')?.getDate()).toBe(9);
  });

  it('builds DD/MM/YYYY from day, month, and year parts', () => {
    expect(formatDateOfBirthParts(9, 3, 2014)).toBe('09/03/2014');
    expect(formatDateOfBirthParts(31, 2, 2014)).toBeNull();
  });

  it('rejects impossible calendar dates', () => {
    expect(parseDateOfBirth('31/02/2014')).toBeNull();
    expect(parseDateOfBirth('2014-03-09')).toBeNull();
    expect(isValidDateOfBirth('31/02/2014', asOf)).toBe(false);
  });

  it('accepts dates within the age-gate year range', () => {
    expect(isValidDateOfBirth('15/06/2014', asOf)).toBe(true);
    expect(isValidDateOfBirth('15/06/2023', asOf)).toBe(false);
    expect(birthYearFromDateOfBirth('15/06/2014')).toBe(2014);
  });

  it('keeps a saved date of birth write-once', () => {
    expect(
      resolveWritableDateOfBirth('15/06/2014', '01/01/2010', asOf),
    ).toBe('15/06/2014');
  });

  it('accepts a new date of birth when none is saved yet', () => {
    expect(resolveWritableDateOfBirth(null, '15/06/2010', asOf)).toBe(
      '15/06/2010',
    );
  });
});

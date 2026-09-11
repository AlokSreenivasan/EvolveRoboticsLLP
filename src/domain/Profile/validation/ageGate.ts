const MIN_AGE_YEARS = 4;
const MAX_AGE_YEARS = 80;

export function currentCalendarYear(asOf: Date = new Date()): number {
  return asOf.getFullYear();
}

export function minAllowedBirthYear(asOf: Date = new Date()): number {
  return currentCalendarYear(asOf) - MAX_AGE_YEARS;
}

export function maxAllowedBirthYear(asOf: Date = new Date()): number {
  return currentCalendarYear(asOf) - MIN_AGE_YEARS;
}

export function birthYearOptions(asOf: Date = new Date()): number[] {
  const max = maxAllowedBirthYear(asOf);
  const min = minAllowedBirthYear(asOf);
  const years: number[] = [];
  for (let year = max; year >= min; year -= 1) {
    years.push(year);
  }
  return years;
}

export function isValidBirthYear(
  birthYear: number | null | undefined,
  asOf: Date = new Date(),
): birthYear is number {
  return (
    typeof birthYear === 'number' &&
    Number.isInteger(birthYear) &&
    birthYear >= minAllowedBirthYear(asOf) &&
    birthYear <= maxAllowedBirthYear(asOf)
  );
}

/**
 * Birth-year-only age band: under 13 when calendar year minus birth year is
 * less than 13. Does not collect a full date of birth.
 */
export function isUnder13(
  birthYear: number | null | undefined,
  asOf: Date = new Date(),
): boolean {
  if (!isValidBirthYear(birthYear, asOf)) {
    return false;
  }
  return currentCalendarYear(asOf) - birthYear < 13;
}

export function needsParentalConsent(
  birthYear: number | null | undefined,
  parentalConsentAtMs: number | null | undefined,
  asOf: Date = new Date(),
): boolean {
  return isUnder13(birthYear, asOf) && parentalConsentAtMs == null;
}

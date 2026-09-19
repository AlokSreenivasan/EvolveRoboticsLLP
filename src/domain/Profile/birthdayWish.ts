import { parseDateOfBirth } from './validation/dateOfBirth';

const FALLBACK_FIRST_NAME = 'Learner';

function isLeapYear(year: number): boolean {
  return new Date(year, 1, 29).getDate() === 29;
}

function isFebruary29(date: Date): boolean {
  return date.getMonth() === 1 && date.getDate() === 29;
}

/** True when `asOf` is the calendar birthday, including Feb 29 → Feb 28 in non-leap years. */
export function isBirthdayToday(
  dateOfBirth: string | null | undefined,
  asOf: Date = new Date(),
): boolean {
  const dob = parseDateOfBirth(dateOfBirth);
  if (!dob) {
    return false;
  }

  if (isFebruary29(dob) && !isLeapYear(asOf.getFullYear())) {
    return asOf.getMonth() === 1 && asOf.getDate() === 28;
  }

  return (
    asOf.getMonth() === dob.getMonth() && asOf.getDate() === dob.getDate()
  );
}

/**
 * Whole years completed as of `asOf`. Feb 29 birthdays count as observed on
 * Feb 28 in non-leap years.
 */
export function ageOnDate(
  dateOfBirth: string | null | undefined,
  asOf: Date = new Date(),
): number | null {
  const dob = parseDateOfBirth(dateOfBirth);
  if (!dob) {
    return null;
  }

  let age = asOf.getFullYear() - dob.getFullYear();
  const observedMonth = dob.getMonth();
  const observedDay =
    isFebruary29(dob) && !isLeapYear(asOf.getFullYear()) ? 28 : dob.getDate();

  const birthdayReached =
    asOf.getMonth() > observedMonth ||
    (asOf.getMonth() === observedMonth && asOf.getDate() >= observedDay);

  if (!birthdayReached) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export function firstNameFromDisplayName(
  displayName: string | null | undefined,
): string {
  const first = displayName?.trim().split(/\s+/)[0];
  return first || FALLBACK_FIRST_NAME;
}

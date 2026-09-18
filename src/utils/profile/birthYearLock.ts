import { isValidBirthYear } from '../../domain/Profile/validation/ageGate';
import { isDateOfBirthLocked } from '../../domain/Profile/validation/dateOfBirth';

export function isBirthYearLocked(
  value: number | null | undefined,
): boolean {
  return typeof value === 'number' && Number.isInteger(value);
}

export function resolveWritableBirthYear(
  existing: number | null | undefined,
  next: number | null | undefined,
  existingDateOfBirth?: string | null,
  asOf: Date = new Date(),
): number | null {
  if (isDateOfBirthLocked(existingDateOfBirth) && isBirthYearLocked(existing)) {
    return existing ?? null;
  }
  if (isValidBirthYear(next, asOf)) {
    return next;
  }
  return null;
}

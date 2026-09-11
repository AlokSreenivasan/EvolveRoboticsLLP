import { isValidBirthYear } from '../../domain/Profile/validation/ageGate';

export function isBirthYearLocked(
  value: number | null | undefined,
): boolean {
  return typeof value === 'number' && Number.isInteger(value);
}

export function resolveWritableBirthYear(
  existing: number | null | undefined,
  next: number | null | undefined,
  asOf: Date = new Date(),
): number | null {
  if (isBirthYearLocked(existing)) {
    return existing as number;
  }
  if (isValidBirthYear(next, asOf)) {
    return next;
  }
  return null;
}

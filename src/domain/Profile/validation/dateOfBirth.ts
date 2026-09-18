import {
  isValidBirthYear,
  maxAllowedBirthYear,
  minAllowedBirthYear,
} from './ageGate';

const DATE_OF_BIRTH_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function formatDateOfBirthParts(
  day: number,
  month: number,
  year: number,
): string | null {
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return formatDateOfBirth(date);
}

export function formatDateOfBirth(date: Date): string {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function parseDateOfBirth(
  value: string | null | undefined,
): Date | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const match = DATE_OF_BIRTH_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function birthYearFromDateOfBirth(
  value: string | null | undefined,
): number | null {
  const date = parseDateOfBirth(value);
  return date ? date.getFullYear() : null;
}

export function isValidDateOfBirth(
  value: string | null | undefined,
  asOf: Date = new Date(),
): value is string {
  const date = parseDateOfBirth(value);
  if (!date) {
    return false;
  }
  return isValidBirthYear(date.getFullYear(), asOf);
}

export function dateOfBirthPickerBounds(asOf: Date = new Date()): {
  minimumDate: Date;
  maximumDate: Date;
} {
  return {
    minimumDate: new Date(minAllowedBirthYear(asOf), 0, 1),
    maximumDate: new Date(maxAllowedBirthYear(asOf), 11, 31),
  };
}

export function isDateOfBirthLocked(
  value: string | null | undefined,
): boolean {
  return isValidDateOfBirth(value);
}

export function resolveWritableDateOfBirth(
  existing: string | null | undefined,
  next: string | null | undefined,
  asOf: Date = new Date(),
): string | null {
  if (isDateOfBirthLocked(existing)) {
    return existing ?? null;
  }
  if (!isValidDateOfBirth(next, asOf)) {
    return null;
  }
  return next;
}

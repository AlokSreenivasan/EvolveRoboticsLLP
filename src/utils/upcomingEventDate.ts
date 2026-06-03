export const MONTH_ABBREVS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const;

export type MonthAbbrev = (typeof MONTH_ABBREVS)[number];

export const EVENT_YEAR_MAX = 2030;

export type EventDateOptions = {
  now?: Date;
  year?: number;
};

export function monthAbbrevToIndex(month: string): number {
  const normalized = month.trim().toUpperCase().slice(0, 3);
  const idx = MONTH_ABBREVS.indexOf(normalized as MonthAbbrev);
  return idx >= 0 ? idx : new Date().getMonth();
}

export function getDaysInMonth(monthIndex: number, year: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function clampDayForMonth(
  monthIndex: number,
  day: number,
  year: number,
): number {
  const maxDay = getDaysInMonth(monthIndex, year);
  return Math.min(Math.max(1, day), maxDay);
}

export function parseStoredEventYear(
  year: number | string | undefined | null,
): number | null {
  const parsed =
    typeof year === 'number' ? year : parseInt(String(year ?? '').trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 1970 || parsed > EVENT_YEAR_MAX) {
    return null;
  }
  return parsed;
}

export function hasStoredEventYear(
  year: number | string | undefined | null,
): boolean {
  return parseStoredEventYear(year) != null;
}

function normalizeEventDateOptions(
  options?: Date | EventDateOptions,
): EventDateOptions {
  if (options instanceof Date) {
    return { now: options };
  }
  return options ?? {};
}

/** Calendar date for month/day; uses stored year when set, else next occurrence on/after today. */
export function resolveUpcomingEventDate(
  month: string,
  day: string,
  options?: Date | EventDateOptions,
): Date | null {
  const { now = new Date(), year } = normalizeEventDateOptions(options);
  const monthIndex = monthAbbrevToIndex(month);
  const dayNum = parseInt(day.trim(), 10);
  if (!Number.isFinite(dayNum) || dayNum < 1) {
    return null;
  }

  const storedYear = parseStoredEventYear(year);
  if (storedYear != null) {
    const clampedDay = clampDayForMonth(monthIndex, dayNum, storedYear);
    return startOfLocalDay(new Date(storedYear, monthIndex, clampedDay));
  }

  const today = startOfLocalDay(now);
  let candidateYear = today.getFullYear();
  let clampedDay = clampDayForMonth(monthIndex, dayNum, candidateYear);
  let candidate = startOfLocalDay(
    new Date(candidateYear, monthIndex, clampedDay),
  );

  if (candidate < today) {
    candidateYear += 1;
    if (candidateYear > EVENT_YEAR_MAX) {
      return null;
    }
    clampedDay = clampDayForMonth(monthIndex, dayNum, candidateYear);
    candidate = startOfLocalDay(
      new Date(candidateYear, monthIndex, clampedDay),
    );
  }

  return candidate;
}

export function computeDaysLeftLabel(
  month: string,
  day: string,
  options?: Date | EventDateOptions,
): string {
  const eventDate = resolveUpcomingEventDate(month, day, options);
  if (!eventDate) {
    return '';
  }

  const { now = new Date() } = normalizeEventDateOptions(options);
  const today = startOfLocalDay(now);
  const days = Math.round(
    (eventDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (days < 0) {
    return '';
  }
  if (days === 0) {
    return 'Today';
  }
  if (days === 1) {
    return '1 Day Left';
  }
  return `${days} Days Left`;
}

export function formatMonthDayStrings(
  monthIndex: number,
  day: number,
): { month: string; day: string } {
  const safeIndex = Math.min(Math.max(0, monthIndex), 11);
  return {
    month: MONTH_ABBREVS[safeIndex],
    day: String(day),
  };
}

export function formatEventDateParts(
  date: Date,
): { month: string; day: string; year: number } {
  const { month, day } = formatMonthDayStrings(date.getMonth(), date.getDate());
  return { month, day, year: date.getFullYear() };
}

export function getEventDatePickerBounds(
  now: Date = new Date(),
): { minimumDate: Date; maximumDate: Date } {
  return {
    minimumDate: startOfLocalDay(now),
    maximumDate: startOfLocalDay(new Date(EVENT_YEAR_MAX, 11, 31)),
  };
}

export function clampEventPickerDate(
  date: Date,
  now: Date = new Date(),
): Date {
  const { minimumDate, maximumDate } = getEventDatePickerBounds(now);
  const day = startOfLocalDay(date);
  if (day < minimumDate) {
    return minimumDate;
  }
  if (day > maximumDate) {
    return maximumDate;
  }
  return day;
}

export function formatFullEventDate(
  month: string,
  day: string,
  year?: number,
): string {
  const eventDate = resolveUpcomingEventDate(month, day, { year });
  if (!eventDate) {
    return '';
  }
  return eventDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getDisplayDaysLeftLabel(
  month: string,
  day: string,
  storedLabel: string,
  year?: number,
): string {
  const computed = computeDaysLeftLabel(month, day, { year });
  if (computed) {
    return computed;
  }
  return storedLabel.trim();
}

function startOfLocalDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

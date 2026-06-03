import {
  EVENT_YEAR_MAX,
  clampEventPickerDate,
  computeDaysLeftLabel,
  formatEventDateParts,
  formatMonthDayStrings,
  resolveUpcomingEventDate,
} from '../upcomingEventDate';

describe('upcomingEventDate', () => {
  const fixedNow = new Date(2026, 5, 3); // 3 Jun 2026

  it('resolves same-year future dates without stored year', () => {
    const resolved = resolveUpcomingEventDate('JUL', '10', { now: fixedNow });
    expect(resolved?.getFullYear()).toBe(2026);
    expect(resolved?.getMonth()).toBe(6);
    expect(resolved?.getDate()).toBe(10);
  });

  it('rolls to next year when month/day already passed', () => {
    const resolved = resolveUpcomingEventDate('MAY', '25', { now: fixedNow });
    expect(resolved?.getFullYear()).toBe(2027);
    expect(resolved?.getMonth()).toBe(4);
    expect(resolved?.getDate()).toBe(25);
  });

  it('uses stored year instead of rolling forward', () => {
    const resolved = resolveUpcomingEventDate('MAY', '25', {
      now: fixedNow,
      year: 2028,
    });
    expect(resolved?.getFullYear()).toBe(2028);
    expect(resolved?.getMonth()).toBe(4);
    expect(resolved?.getDate()).toBe(25);
  });

  it('returns null when rolled year exceeds max', () => {
    const lateNow = new Date(EVENT_YEAR_MAX, 11, 15);
    const resolved = resolveUpcomingEventDate('JAN', '1', { now: lateNow });
    expect(resolved).toBeNull();
  });

  it('computes days-left labels from today', () => {
    expect(computeDaysLeftLabel('JUN', '3', { now: fixedNow })).toBe('Today');
    expect(computeDaysLeftLabel('JUN', '4', { now: fixedNow })).toBe(
      '1 Day Left',
    );
    expect(computeDaysLeftLabel('JUN', '10', { now: fixedNow })).toBe(
      '7 Days Left',
    );
  });

  it('computes days-left with stored year', () => {
    expect(
      computeDaysLeftLabel('JUN', '10', { now: fixedNow, year: 2026 }),
    ).toBe('7 Days Left');
    expect(
      computeDaysLeftLabel('MAY', '25', { now: fixedNow, year: 2025 }),
    ).toBe('');
  });

  it('formats month, day, and year for storage', () => {
    expect(formatMonthDayStrings(4, 25)).toEqual({ month: 'MAY', day: '25' });
    expect(formatEventDateParts(new Date(2028, 4, 25))).toEqual({
      month: 'MAY',
      day: '25',
      year: 2028,
    });
  });

  it('clamps picker dates to today through 2030', () => {
    expect(
      clampEventPickerDate(new Date(2040, 0, 1), fixedNow).getFullYear(),
    ).toBe(EVENT_YEAR_MAX);
    const todayStart = new Date(2026, 5, 3);
    todayStart.setHours(0, 0, 0, 0);
    expect(clampEventPickerDate(new Date(2020, 0, 1), fixedNow).getTime()).toBe(
      todayStart.getTime(),
    );
  });
});

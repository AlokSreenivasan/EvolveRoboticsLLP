/**
 * School and grade are write-once: once a non-empty value is saved,
 * it cannot be changed or cleared.
 */
export function isSchoolOrGradeLocked(
  value: string | null | undefined,
): boolean {
  return Boolean(value?.trim());
}

export function resolveWritableSchoolId(
  existing: string | null | undefined,
  next: string | null | undefined,
): string | null {
  if (isSchoolOrGradeLocked(existing)) {
    return existing!.trim();
  }
  const trimmed = next?.trim();
  return trimmed ? trimmed : null;
}

export function resolveWritableGrade(
  existing: string | null | undefined,
  next: string | null | undefined,
): string | null {
  if (isSchoolOrGradeLocked(existing)) {
    return existing!.trim();
  }
  const trimmed = next?.trim();
  return trimmed ? trimmed : null;
}

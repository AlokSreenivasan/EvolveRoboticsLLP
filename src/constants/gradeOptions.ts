import type { School, SchoolGrade } from '../store/content/types/schools.types';

export type GradeOption = {
  value: string;
  label: string;
};

export const GRADE_OPTIONS: GradeOption[] = [
  { value: 'nursery', label: 'Nursery' },
  { value: 'lkg', label: 'LKG' },
  { value: 'ukg', label: 'UKG' },
  ...Array.from({ length: 12 }, (_, index) => {
    const grade = index + 1;
    return { value: String(grade), label: `Grade ${grade}` };
  }),
];

export function schoolGradesToOptions(grades: SchoolGrade[]): GradeOption[] {
  return [...grades]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(grade => ({ value: grade.id, label: grade.name }));
}

/**
 * Prefer the school's configured grades. Fall back to the global list when a
 * school has none yet (legacy schools / migration).
 */
export function resolveGradeOptionsForSchool(
  school: School | null | undefined,
): GradeOption[] {
  if (school?.grades?.length) {
    return schoolGradesToOptions(school.grades);
  }
  return GRADE_OPTIONS;
}

export function getGradeLabel(
  value: string | null | undefined,
  schools?: Array<Pick<School, 'grades'>>,
): string | null {
  if (!value?.trim()) {
    return null;
  }

  const fromGlobal = GRADE_OPTIONS.find(option => option.value === value)?.label;
  if (fromGlobal) {
    return fromGlobal;
  }

  if (schools) {
    for (const school of schools) {
      const match = school.grades?.find(grade => grade.id === value);
      if (match?.name) {
        return match.name;
      }
    }
  }

  return null;
}

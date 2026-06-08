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

export function getGradeLabel(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }
  return GRADE_OPTIONS.find(option => option.value === value)?.label ?? null;
}

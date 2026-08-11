/** Deterministic channel id for a school + grade class forum. */
export function buildClassForumChannelId(
  schoolId: string,
  grade: string,
): string {
  const safeSchool = schoolId.trim();
  const safeGrade = grade.trim().replace(/[/.#$[\]]/g, '_');
  return `${safeSchool}__${safeGrade}`;
}

export function buildClassForumChannelTitle(
  schoolName: string,
  gradeLabel: string,
): string {
  const school = schoolName.trim() || 'School';
  const grade = gradeLabel.trim() || 'Class';
  return `${school} · ${grade}`;
}

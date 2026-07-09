import type { CourseTrack } from '../../../store/content/types/courses.types';

export type Profile = {
  fullName: string;
  contactNumber: string;
  track: CourseTrack | null;
  photoUri: string | null;
  schoolId: string | null;
  grade: string | null;
};

export const emptyProfile = (): Profile => ({
  fullName: '',
  contactNumber: '',
  track: null,
  photoUri: null,
  schoolId: null,
  grade: null,
});

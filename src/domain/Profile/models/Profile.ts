export type Profile = {
  fullName: string;
  contactNumber: string;
  photoUri: string | null;
  schoolId: string | null;
  grade: string | null;
};

export const emptyProfile = (): Profile => ({
  fullName: '',
  contactNumber: '',
  photoUri: null,
  schoolId: null,
  grade: null,
});

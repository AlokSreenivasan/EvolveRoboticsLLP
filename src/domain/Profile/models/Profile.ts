export type Profile = {
  fullName: string;
  contactNumber: string;
  photoUri: string | null;
};

export const emptyProfile = (): Profile => ({
  fullName: '',
  contactNumber: '',
  photoUri: null,
});

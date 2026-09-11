import { validateProfileForm } from '../validateProfileForm';

const completeKids = {
  fullName: 'Ada Lovelace',
  contactNumber: '9876543210',
  track: 'kids' as const,
  schoolId: 'school-1',
  grade: '5',
  birthYear: new Date().getFullYear() - 10,
};

describe('validateProfileForm', () => {
  it('requires birth year for learners', () => {
    const errors = validateProfileForm({
      ...completeKids,
      birthYear: null,
    });
    expect(errors.birthYear).toBeDefined();
  });

  it('accepts a complete kids profile with a valid birth year', () => {
    expect(validateProfileForm(completeKids)).toEqual({});
  });

  it('does not require birth year for admin profile edits', () => {
    const errors = validateProfileForm(
      {
        fullName: 'Admin',
        contactNumber: '9876543210',
        track: null,
        schoolId: null,
        grade: null,
        birthYear: null,
      },
      { requireTrack: false, requireAgeDeclaration: false },
    );
    expect(errors).toEqual({});
  });
});

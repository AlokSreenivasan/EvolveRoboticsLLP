import { validateProfileForm } from '../validateProfileForm';

const completeKids = {
  fullName: 'Ada Lovelace',
  contactNumber: '9876543210',
  track: 'kids' as const,
  schoolId: 'school-1',
  grade: '5',
  birthYear: new Date().getFullYear() - 10,
  dateOfBirth: `15/06/${new Date().getFullYear() - 10}`,
};

describe('validateProfileForm', () => {
  it('requires date of birth for learners', () => {
    const errors = validateProfileForm({
      ...completeKids,
      birthYear: null,
      dateOfBirth: null,
    });
    expect(errors.dateOfBirth).toBeDefined();
  });

  it('accepts a complete kids profile with a valid date of birth', () => {
    expect(validateProfileForm(completeKids)).toEqual({});
  });

  it('does not require a learning track for admin profile edits', () => {
    const year = new Date().getFullYear() - 18;
    const errors = validateProfileForm(
      {
        fullName: 'Admin',
        contactNumber: '9876543210',
        track: null,
        schoolId: null,
        grade: null,
        birthYear: year,
        dateOfBirth: `15/06/${year}`,
      },
      { requireTrack: false, requireAgeDeclaration: true },
    );
    expect(errors).toEqual({});
  });

  it('still requires date of birth for admin profile edits', () => {
    const errors = validateProfileForm(
      {
        fullName: 'Admin',
        contactNumber: '9876543210',
        track: null,
        schoolId: null,
        grade: null,
        birthYear: null,
        dateOfBirth: null,
      },
      { requireTrack: false, requireAgeDeclaration: true },
    );
    expect(errors.dateOfBirth).toBeDefined();
  });
});

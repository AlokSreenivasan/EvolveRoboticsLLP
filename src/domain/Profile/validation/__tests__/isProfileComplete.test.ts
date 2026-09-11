import type { UserProfile } from '../../../../store/user/types';
import { isProfileComplete } from '../isProfileComplete';

const under13BirthYear = new Date().getFullYear() - 10;
const over13BirthYear = new Date().getFullYear() - 18;

function profile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    uid: 'u1',
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    phoneNumber: '9876543210',
    profileImage: null,
    schoolId: 'school-1',
    grade: '5',
    track: 'kids',
    birthYear: under13BirthYear,
    parentalConsentAtMs: 1,
    role: 'user',
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe('isProfileComplete', () => {
  it('is false when a learner is missing birth year', () => {
    expect(isProfileComplete(profile({ birthYear: null }))).toBe(false);
  });

  it('is false when an under-13 learner has no parental consent', () => {
    expect(
      isProfileComplete(
        profile({ birthYear: under13BirthYear, parentalConsentAtMs: null }),
      ),
    ).toBe(false);
  });

  it('is true for an under-13 learner with consent and kids fields', () => {
    expect(isProfileComplete(profile())).toBe(true);
  });

  it('is true for a 13+ professional without school or consent', () => {
    expect(
      isProfileComplete(
        profile({
          track: 'professionals',
          schoolId: null,
          grade: null,
          birthYear: over13BirthYear,
          parentalConsentAtMs: null,
        }),
      ),
    ).toBe(true);
  });

  it('skips track and age for admins', () => {
    expect(
      isProfileComplete(
        profile({
          role: 'admin',
          track: null,
          schoolId: null,
          grade: null,
          birthYear: null,
          parentalConsentAtMs: null,
        }),
      ),
    ).toBe(true);
  });
});

/**
 * Firestore security-rules tests. Run with the emulator:
 *   npm run test:rules
 * (wraps `firebase emulators:exec --only firestore`)
 */
const fs = require('fs');
const path = require('path');
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require('@firebase/rules-unit-testing');
const {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} = require('firebase/firestore');

const PROJECT_ID = 'demo-evolve-rules';

const OWNER_UID = 'user-owner';
const OTHER_UID = 'user-other';
const ADMIN_UID = 'user-admin';
const SUPERADMIN_UID = 'user-superadmin';

let testEnv;

function validProfile(overrides = {}) {
  return {
    fullName: 'Test User',
    email: 'test@example.com',
    phoneNumber: '9876543210',
    profileImage: '',
    // The app always writes these keys (null when unset) and the rules
    // read them unconditionally, so they must be present.
    schoolId: null,
    grade: null,
    track: null,
    role: 'user',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

function db(uid) {
  return uid
    ? testEnv.authenticatedContext(uid).firestore()
    : testEnv.unauthenticatedContext().firestore();
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: fs.readFileSync(
        path.resolve(__dirname, '../../firestore.rules'),
        'utf8',
      ),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();

  // Seed role documents and shared fixtures with rules disabled.
  await testEnv.withSecurityRulesDisabled(async context => {
    const adminDb = context.firestore();
    const seedProfile = role => ({
      fullName: 'Seeded',
      email: 'seed@example.com',
      phoneNumber: '9876543210',
      profileImage: '',
      schoolId: null,
      grade: null,
      track: null,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await setDoc(doc(adminDb, 'users', OWNER_UID), seedProfile('user'));
    await setDoc(doc(adminDb, 'users', OTHER_UID), seedProfile('user'));
    await setDoc(doc(adminDb, 'users', ADMIN_UID), seedProfile('admin'));
    await setDoc(doc(adminDb, 'users', SUPERADMIN_UID), seedProfile('superadmin'));

    await setDoc(doc(adminDb, 'courses', 'published-course'), {
      title: 'Published',
      isPublished: true,
    });
    await setDoc(doc(adminDb, 'courses', 'draft-course'), {
      title: 'Draft',
      isPublished: false,
    });
    await setDoc(
      doc(adminDb, 'users', OWNER_UID, 'quizAttempts', 'quiz1'),
      { quizId: 'quiz1', percentage: 100 },
    );
    await setDoc(
      doc(adminDb, 'users', OWNER_UID, 'examAttempts', 'attempt1'),
      { examId: 'exam1', percentage: 80 },
    );
  });
});

describe('users collection', () => {
  test('unauthenticated users cannot read profiles', async () => {
    await assertFails(getDoc(doc(db(null), 'users', OWNER_UID)));
  });

  test('owners can read their own profile', async () => {
    await assertSucceeds(getDoc(doc(db(OWNER_UID), 'users', OWNER_UID)));
  });

  test('users cannot read other profiles', async () => {
    await assertFails(getDoc(doc(db(OTHER_UID), 'users', OWNER_UID)));
  });

  test('superadmins can read any profile', async () => {
    await assertSucceeds(getDoc(doc(db(SUPERADMIN_UID), 'users', OWNER_UID)));
  });

  test('admins cannot read other profiles (superadmin only)', async () => {
    await assertFails(getDoc(doc(db(ADMIN_UID), 'users', OWNER_UID)));
  });

  test('a new user can create their own profile with role user', async () => {
    await assertSucceeds(
      setDoc(doc(db('new-user'), 'users', 'new-user'), validProfile()),
    );
  });

  test('a new user cannot self-assign an elevated role', async () => {
    await assertFails(
      setDoc(
        doc(db('new-user'), 'users', 'new-user'),
        validProfile({ role: 'admin' }),
      ),
    );
    await assertFails(
      setDoc(
        doc(db('new-user'), 'users', 'new-user'),
        validProfile({ role: 'superadmin' }),
      ),
    );
  });

  test('users cannot create profiles for other uids', async () => {
    await assertFails(
      setDoc(doc(db('new-user'), 'users', 'someone-else'), validProfile()),
    );
  });

  test('a new user can create a profile with an empty phone (Google Sign-In)', async () => {
    await assertSucceeds(
      setDoc(
        doc(db('google-user'), 'users', 'google-user'),
        validProfile({ phoneNumber: '' }),
      ),
    );
  });

  test('profile create rejects phone numbers that are too short (non-empty)', async () => {
    await assertFails(
      setDoc(
        doc(db('new-user'), 'users', 'new-user'),
        validProfile({ phoneNumber: '12345' }),
      ),
    );
  });

  test('profile create requires all mandatory fields', async () => {
    const incomplete = validProfile();
    delete incomplete.phoneNumber;
    await assertFails(
      setDoc(doc(db('new-user'), 'users', 'new-user'), incomplete),
    );
  });

  test('owners can update their own profile fields', async () => {
    await assertSucceeds(
      updateDoc(doc(db(OWNER_UID), 'users', OWNER_UID), {
        fullName: 'Renamed User',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('owners can set school and grade once', async () => {
    await assertSucceeds(
      updateDoc(doc(db(OWNER_UID), 'users', OWNER_UID), {
        schoolId: 'school-1',
        grade: '8',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('owners cannot change school or grade after they are set', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await updateDoc(doc(context.firestore(), 'users', OWNER_UID), {
        schoolId: 'school-1',
        grade: '8',
      });
    });

    await assertFails(
      updateDoc(doc(db(OWNER_UID), 'users', OWNER_UID), {
        schoolId: 'school-2',
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(db(OWNER_UID), 'users', OWNER_UID), {
        grade: '9',
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(db(OWNER_UID), 'users', OWNER_UID), {
        schoolId: null,
        grade: null,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('owners can keep the same school and grade on later updates', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await updateDoc(doc(context.firestore(), 'users', OWNER_UID), {
        schoolId: 'school-1',
        grade: '8',
      });
    });

    await assertSucceeds(
      updateDoc(doc(db(OWNER_UID), 'users', OWNER_UID), {
        fullName: 'Still Same School',
        schoolId: 'school-1',
        grade: '8',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('owners can set birth year once', async () => {
    const year = new Date().getFullYear() - 18;
    await assertSucceeds(
      updateDoc(doc(db(OWNER_UID), 'users', OWNER_UID), {
        birthYear: year,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('owners cannot change birth year after it is set', async () => {
    const year = new Date().getFullYear() - 18;
    await testEnv.withSecurityRulesDisabled(async context => {
      await updateDoc(doc(context.firestore(), 'users', OWNER_UID), {
        birthYear: year,
      });
    });

    await assertFails(
      updateDoc(doc(db(OWNER_UID), 'users', OWNER_UID), {
        birthYear: year - 1,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('under-13 learners with a track need parental consent', async () => {
    const year = new Date().getFullYear() - 10;
    await assertFails(
      updateDoc(doc(db(OWNER_UID), 'users', OWNER_UID), {
        track: 'professionals',
        birthYear: year,
        updatedAt: serverTimestamp(),
      }),
    );

    await assertSucceeds(
      updateDoc(doc(db(OWNER_UID), 'users', OWNER_UID), {
        track: 'professionals',
        birthYear: year,
        parentalConsentAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('13+ learners can set a track without parental consent', async () => {
    const year = new Date().getFullYear() - 18;
    await assertSucceeds(
      updateDoc(doc(db(OWNER_UID), 'users', OWNER_UID), {
        track: 'professionals',
        birthYear: year,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('setting a track without a birth year is rejected', async () => {
    await assertFails(
      updateDoc(doc(db(OWNER_UID), 'users', OWNER_UID), {
        track: 'kids',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('owners can save a typical profile payload with a whole-number birth year', async () => {
    const year = new Date().getFullYear() - 18;
    await assertSucceeds(
      updateDoc(doc(db(OWNER_UID), 'users', OWNER_UID), {
        fullName: 'Renamed User',
        phoneNumber: '9876543210',
        profileImage: null,
        schoolId: null,
        grade: null,
        track: 'professionals',
        birthYear: year,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('fractional birth years are rejected', async () => {
    await assertFails(
      updateDoc(doc(db(OWNER_UID), 'users', OWNER_UID), {
        birthYear: new Date().getFullYear() - 18.5,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('admins can update their own profile without a birth year', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await updateDoc(doc(context.firestore(), 'users', ADMIN_UID), {
        track: 'professionals',
      });
    });

    await assertSucceeds(
      updateDoc(doc(db(ADMIN_UID), 'users', ADMIN_UID), {
        fullName: 'Admin Name',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('owners cannot change their own role', async () => {
    await assertFails(
      updateDoc(doc(db(OWNER_UID), 'users', OWNER_UID), {
        role: 'admin',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('superadmins can promote a user to admin', async () => {
    await assertSucceeds(
      updateDoc(doc(db(SUPERADMIN_UID), 'users', OWNER_UID), {
        role: 'admin',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('superadmins can demote an admin to user', async () => {
    await assertSucceeds(
      updateDoc(doc(db(SUPERADMIN_UID), 'users', ADMIN_UID), {
        role: 'user',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('admins cannot change another user role', async () => {
    await assertFails(
      updateDoc(doc(db(ADMIN_UID), 'users', OWNER_UID), {
        role: 'admin',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('superadmins cannot promote a user to superadmin', async () => {
    await assertFails(
      updateDoc(doc(db(SUPERADMIN_UID), 'users', OWNER_UID), {
        role: 'superadmin',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('owners can delete their own profile', async () => {
    await assertSucceeds(deleteDoc(doc(db(OWNER_UID), 'users', OWNER_UID)));
  });
});

describe('attempt subcollections (server-graded)', () => {
  test('owners can read their exam attempts but cannot write them', async () => {
    const database = db(OWNER_UID);
    await assertSucceeds(
      getDoc(doc(database, 'users', OWNER_UID, 'examAttempts', 'attempt1')),
    );
    await assertFails(
      setDoc(doc(database, 'users', OWNER_UID, 'examAttempts', 'forged'), {
        examId: 'exam1',
        percentage: 100,
      }),
    );
  });

  test('owners cannot forge quiz attempts', async () => {
    await assertFails(
      setDoc(doc(db(OWNER_UID), 'users', OWNER_UID, 'quizAttempts', 'quiz2'), {
        quizId: 'quiz2',
        percentage: 100,
        xpEarned: 9999,
      }),
    );
  });

  test('other users cannot read someone else\'s attempts', async () => {
    await assertFails(
      getDoc(doc(db(OTHER_UID), 'users', OWNER_UID, 'quizAttempts', 'quiz1')),
    );
  });

  test('superadmins can read and delete quiz attempts', async () => {
    const database = db(SUPERADMIN_UID);
    await assertSucceeds(
      getDoc(doc(database, 'users', OWNER_UID, 'quizAttempts', 'quiz1')),
    );
    await assertSucceeds(
      deleteDoc(doc(database, 'users', OWNER_UID, 'quizAttempts', 'quiz1')),
    );
  });
});

describe('fcmTokens subcollection', () => {
  test('owners can register a valid token', async () => {
    await assertSucceeds(
      setDoc(doc(db(OWNER_UID), 'users', OWNER_UID, 'fcmTokens', 'token1'), {
        token: 'fcm-token-value',
        platform: 'android',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('token writes with an invalid platform are rejected', async () => {
    await assertFails(
      setDoc(doc(db(OWNER_UID), 'users', OWNER_UID, 'fcmTokens', 'token1'), {
        token: 'fcm-token-value',
        platform: 'web',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('users cannot write tokens for other users', async () => {
    await assertFails(
      setDoc(doc(db(OTHER_UID), 'users', OWNER_UID, 'fcmTokens', 'token1'), {
        token: 'fcm-token-value',
        platform: 'ios',
        updatedAt: serverTimestamp(),
      }),
    );
  });
});

describe('CMS content (courses)', () => {
  const validCourse = {
    title: 'New Course',
    subtitle: 'Subtitle',
    imageUri: 'https://example.com/img.png',
    durationLabel: '4 weeks',
    description: 'A course',
    sortOrder: 0,
    isPublished: true,
    track: 'kids',
  };

  test('authenticated learners can read published courses only', async () => {
    const database = db(OWNER_UID);
    await assertSucceeds(getDoc(doc(database, 'courses', 'published-course')));
    await assertFails(getDoc(doc(database, 'courses', 'draft-course')));
  });

  test('admins can read draft courses', async () => {
    await assertSucceeds(getDoc(doc(db(ADMIN_UID), 'courses', 'draft-course')));
  });

  test('unauthenticated users cannot read courses', async () => {
    await assertFails(getDoc(doc(db(null), 'courses', 'published-course')));
  });

  test('superadmins can create a valid course', async () => {
    await assertSucceeds(
      setDoc(doc(db(SUPERADMIN_UID), 'courses', 'new-course'), validCourse),
    );
  });

  test('admins cannot create courses (superadmin-only collection)', async () => {
    await assertFails(
      setDoc(doc(db(ADMIN_UID), 'courses', 'new-course'), validCourse),
    );
  });

  test('course create without a valid track is rejected', async () => {
    await assertFails(
      setDoc(doc(db(SUPERADMIN_UID), 'courses', 'new-course'), {
        ...validCourse,
        track: 'adults',
      }),
    );
  });
});

describe('appContent section headings', () => {
  const validSection = {
    sectionTitle: 'Resources',
    sectionSubtitle: 'Study notes',
    actionLabel: '',
    updatedAt: serverTimestamp(),
  };

  test('admins can write resources and assignments section docs', async () => {
    await assertSucceeds(
      setDoc(doc(db(ADMIN_UID), 'appContent', 'resources'), validSection),
    );
    await assertSucceeds(
      setDoc(doc(db(ADMIN_UID), 'appContent', 'assignments'), {
        ...validSection,
        sectionTitle: 'Assignments',
      }),
    );
  });

  test('admins cannot write superadmin-only section docs', async () => {
    await assertFails(
      setDoc(doc(db(ADMIN_UID), 'appContent', 'importantUpdates'), {
        ...validSection,
        sectionTitle: 'Important Updates',
        actionLabel: 'View All',
      }),
    );
  });

  test('superadmins can write any section doc', async () => {
    await assertSucceeds(
      setDoc(doc(db(SUPERADMIN_UID), 'appContent', 'importantUpdates'), {
        ...validSection,
        sectionTitle: 'Important Updates',
        actionLabel: 'View All',
      }),
    );
  });

  test('regular users cannot write section docs', async () => {
    await assertFails(
      setDoc(doc(db(OWNER_UID), 'appContent', 'resources'), validSection),
    );
  });
});

describe('admin-writable content (resourceNotes)', () => {
  const validNote = {
    title: 'Note',
    subtitle: '',
    pdfUrl: 'https://example.com/note.pdf',
    sortOrder: 0,
    isPublished: true,
    track: 'professionals',
  };

  test('admins can create a valid resource note', async () => {
    await assertSucceeds(
      setDoc(doc(db(ADMIN_UID), 'resourceNotes', 'note1'), validNote),
    );
  });

  test('regular users cannot create resource notes', async () => {
    await assertFails(
      setDoc(doc(db(OWNER_UID), 'resourceNotes', 'note1'), validNote),
    );
  });
});

describe('admin-writable content (assignments)', () => {
  const validAssignment = {
    title: 'Lab report',
    subtitle: '',
    dueDateLabel: 'Due Friday',
    pdfUrl: '',
    sortOrder: 0,
    isPublished: true,
    track: 'professionals',
    audience: 'all',
    schoolIds: [],
    schoolGradeIds: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  test('superadmins can create an assignment stub then set pdfUrl', async () => {
    const database = db(SUPERADMIN_UID);
    await assertSucceeds(
      setDoc(doc(database, 'assignments', 'a1'), validAssignment),
    );
    await assertSucceeds(
      updateDoc(doc(database, 'assignments', 'a1'), {
        pdfUrl: 'https://example.com/a1.pdf',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('admins can create a valid assignment', async () => {
    await assertSucceeds(
      setDoc(doc(db(ADMIN_UID), 'assignments', 'a2'), validAssignment),
    );
  });

  test('regular users cannot create assignments', async () => {
    await assertFails(
      setDoc(doc(db(OWNER_UID), 'assignments', 'a3'), validAssignment),
    );
  });
});

describe('answer keys', () => {
  test('regular users cannot read answer keys', async () => {
    await assertFails(getDoc(doc(db(OWNER_UID), 'examAnswerKeys', 'exam1')));
    await assertFails(getDoc(doc(db(OWNER_UID), 'quizAnswerKeys', 'quiz1')));
  });

  test('admins can read and write answer keys', async () => {
    const database = db(ADMIN_UID);
    await assertSucceeds(
      setDoc(doc(database, 'examAnswerKeys', 'exam1'), {
        byQuestionId: { q1: 2 },
      }),
    );
    await assertSucceeds(getDoc(doc(database, 'examAnswerKeys', 'exam1')));
  });
});

describe('schools collection (Add Schools)', () => {
  const validSchool = {
    name: 'Riverside High School',
    city: 'Austin, TX',
    sortOrder: 0,
    grades: [
      { id: 'grade_1', name: 'Grade 1', sortOrder: 0 },
      { id: 'grade_2', name: 'Grade 2', sortOrder: 1 },
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  test('authenticated users can read schools', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'schools', 'school1'), {
        ...validSchool,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    await assertSucceeds(getDoc(doc(db(OWNER_UID), 'schools', 'school1')));
  });

  test('unauthenticated users cannot read schools', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'schools', 'school1'), {
        ...validSchool,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    await assertFails(getDoc(doc(db(null), 'schools', 'school1')));
  });

  test('superadmins can create, update, and delete schools', async () => {
    const database = db(SUPERADMIN_UID);

    await assertSucceeds(
      setDoc(doc(database, 'schools', 'school-new'), validSchool),
    );

    await assertSucceeds(
      updateDoc(doc(database, 'schools', 'school-new'), {
        name: 'Riverside Academy',
        city: 'Dallas, TX',
        updatedAt: serverTimestamp(),
      }),
    );

    await assertSucceeds(
      updateDoc(doc(database, 'schools', 'school-new'), {
        sortOrder: 1,
        updatedAt: serverTimestamp(),
      }),
    );

    await assertSucceeds(
      updateDoc(doc(database, 'schools', 'school-new'), {
        grades: [{ id: 'grade_8', name: 'Grade 8', sortOrder: 0 }],
        updatedAt: serverTimestamp(),
      }),
    );

    await assertSucceeds(deleteDoc(doc(database, 'schools', 'school-new')));
  });

  test('admins cannot create, update, or delete schools', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'schools', 'school1'), {
        ...validSchool,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    const database = db(ADMIN_UID);

    await assertFails(
      setDoc(doc(database, 'schools', 'school-admin'), validSchool),
    );
    await assertFails(
      updateDoc(doc(database, 'schools', 'school1'), {
        name: 'Hacked School',
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(deleteDoc(doc(database, 'schools', 'school1')));
  });

  test('school create without a name is rejected', async () => {
    await assertFails(
      setDoc(doc(db(SUPERADMIN_UID), 'schools', 'school-bad'), {
        ...validSchool,
        name: '',
      }),
    );
  });

  test('school create with city over 200 chars is rejected', async () => {
    await assertFails(
      setDoc(doc(db(SUPERADMIN_UID), 'schools', 'school-bad'), {
        ...validSchool,
        city: 'x'.repeat(201),
      }),
    );
  });

  test('school create with more than 40 grades is rejected', async () => {
    await assertFails(
      setDoc(doc(db(SUPERADMIN_UID), 'schools', 'school-bad'), {
        ...validSchool,
        grades: Array.from({ length: 41 }, (_, index) => ({
          id: `grade_${index}`,
          name: `Grade ${index}`,
          sortOrder: index,
        })),
      }),
    );
  });
});

describe('chatKeywords', () => {
  const validKeyword = {
    label: 'Courses',
    response: 'Browse available courses.',
    sortOrder: 0,
    isPublished: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'chatKeywords', 'published-kw'), {
        ...validKeyword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await setDoc(doc(adminDb, 'chatKeywords', 'draft-kw'), {
        ...validKeyword,
        label: 'Draft',
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  });

  test('authenticated users can read published keywords', async () => {
    await assertSucceeds(
      getDoc(doc(db(OWNER_UID), 'chatKeywords', 'published-kw')),
    );
  });

  test('learners cannot read draft keywords', async () => {
    await assertFails(getDoc(doc(db(OWNER_UID), 'chatKeywords', 'draft-kw')));
  });

  test('admins can read draft keywords', async () => {
    await assertSucceeds(
      getDoc(doc(db(ADMIN_UID), 'chatKeywords', 'draft-kw')),
    );
  });

  test('superadmins can create, update, reorder, and delete keywords', async () => {
    const database = db(SUPERADMIN_UID);
    await assertSucceeds(
      setDoc(doc(database, 'chatKeywords', 'kw1'), validKeyword),
    );
    await assertSucceeds(
      updateDoc(doc(database, 'chatKeywords', 'kw1'), {
        response: 'Updated reply',
        updatedAt: serverTimestamp(),
      }),
    );
    await assertSucceeds(
      updateDoc(doc(database, 'chatKeywords', 'kw1'), {
        sortOrder: 1,
        updatedAt: serverTimestamp(),
      }),
    );
    await assertSucceeds(deleteDoc(doc(database, 'chatKeywords', 'kw1')));
  });

  test('plain admins cannot write chat keywords', async () => {
    await assertFails(
      setDoc(doc(db(ADMIN_UID), 'chatKeywords', 'kw-admin'), validKeyword),
    );
  });

  test('regular users cannot write chat keywords', async () => {
    await assertFails(
      setDoc(doc(db(OWNER_UID), 'chatKeywords', 'kw-user'), validKeyword),
    );
  });

  test('keyword create with empty label is rejected', async () => {
    await assertFails(
      setDoc(doc(db(SUPERADMIN_UID), 'chatKeywords', 'kw-bad'), {
        ...validKeyword,
        label: '',
      }),
    );
  });

  test('keyword create with response over 1000 chars is rejected', async () => {
    await assertFails(
      setDoc(doc(db(SUPERADMIN_UID), 'chatKeywords', 'kw-long'), {
        ...validKeyword,
        response: 'x'.repeat(1001),
      }),
    );
  });
});

describe('classForumChannels', () => {
  const schoolId = 'school-a';
  const grade = '7';
  const channelId = `${schoolId}__${grade}`;

  const validChannel = {
    schoolId,
    grade,
    schoolName: 'Test School',
    title: 'Test School · Grade 7',
    isLocked: false,
    messageCount: 0,
    lastMessagePreview: '',
    lastMessageAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users', OWNER_UID), {
        fullName: 'Owner',
        email: 'owner@example.com',
        phoneNumber: '9876543210',
        profileImage: '',
        schoolId,
        grade,
        track: 'kids',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await setDoc(doc(adminDb, 'users', OTHER_UID), {
        fullName: 'Other',
        email: 'other@example.com',
        phoneNumber: '9876543211',
        profileImage: '',
        schoolId: 'school-b',
        grade: '8',
        track: 'kids',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  });

  test('students can create and read their own class channel', async () => {
    const database = db(OWNER_UID);
    await assertSucceeds(
      setDoc(doc(database, 'classForumChannels', channelId), validChannel),
    );
    await assertSucceeds(
      getDoc(doc(database, 'classForumChannels', channelId)),
    );
  });

  test('students cannot read another class channel', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(
        doc(context.firestore(), 'classForumChannels', channelId),
        {
          ...validChannel,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );
    });

    await assertFails(
      getDoc(doc(db(OTHER_UID), 'classForumChannels', channelId)),
    );
  });

  test('global admins can read any class channel', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(
        doc(context.firestore(), 'classForumChannels', channelId),
        {
          ...validChannel,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );
    });

    await assertSucceeds(
      getDoc(doc(db(ADMIN_UID), 'classForumChannels', channelId)),
    );
  });

  test('students can post messages in their unlocked class channel', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(
        doc(context.firestore(), 'classForumChannels', channelId),
        {
          ...validChannel,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );
    });

    await assertSucceeds(
      setDoc(doc(db(OWNER_UID), 'classForumChannels', channelId, 'messages', 'm1'), {
        text: 'Hello class',
        senderId: OWNER_UID,
        senderName: 'Owner',
        senderRole: 'user',
        isPinned: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('students cannot post when the channel is locked', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(
        doc(context.firestore(), 'classForumChannels', channelId),
        {
          ...validChannel,
          isLocked: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );
    });

    await assertFails(
      setDoc(doc(db(OWNER_UID), 'classForumChannels', channelId, 'messages', 'm2'), {
        text: 'Should fail',
        senderId: OWNER_UID,
        senderName: 'Owner',
        senderRole: 'user',
        isPinned: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('admins can post in a locked channel', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(
        doc(context.firestore(), 'classForumChannels', channelId),
        {
          ...validChannel,
          isLocked: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );
    });

    await assertSucceeds(
      setDoc(doc(db(ADMIN_UID), 'classForumChannels', channelId, 'messages', 'm3'), {
        text: 'Facilitator note',
        senderId: ADMIN_UID,
        senderName: 'Admin',
        senderRole: 'admin',
        isPinned: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  test('students can report messages in their class', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(
        doc(context.firestore(), 'classForumChannels', channelId),
        {
          ...validChannel,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );
    });

    await assertSucceeds(
      setDoc(doc(db(OWNER_UID), 'classForumChannels', channelId, 'reports', 'r1'), {
        messageId: 'm1',
        messageText: 'bad',
        reportedSenderId: OTHER_UID,
        reporterId: OWNER_UID,
        reporterName: 'Owner',
        reason: 'Inappropriate',
        createdAt: serverTimestamp(),
      }),
    );
  });

  test('students can delete their own message within 15 seconds', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'classForumChannels', channelId), {
        ...validChannel,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await setDoc(
        doc(adminDb, 'classForumChannels', channelId, 'messages', 'm-delete-ok'),
        {
          text: 'Fresh message',
          senderId: OWNER_UID,
          senderName: 'Owner',
          senderRole: 'user',
          isPinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );
    });

    await assertSucceeds(
      deleteDoc(
        doc(
          db(OWNER_UID),
          'classForumChannels',
          channelId,
          'messages',
          'm-delete-ok',
        ),
      ),
    );
  });

  test('students cannot delete their own message after 15 seconds', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'classForumChannels', channelId), {
        ...validChannel,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await setDoc(
        doc(adminDb, 'classForumChannels', channelId, 'messages', 'm-delete-late'),
        {
          text: 'Old message',
          senderId: OWNER_UID,
          senderName: 'Owner',
          senderRole: 'user',
          isPinned: false,
          createdAt: new Date(Date.now() - 20_000),
          updatedAt: new Date(Date.now() - 20_000),
        },
      );
    });

    await assertFails(
      deleteDoc(
        doc(
          db(OWNER_UID),
          'classForumChannels',
          channelId,
          'messages',
          'm-delete-late',
        ),
      ),
    );
  });

  test('admins can delete any message after 15 seconds', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'classForumChannels', channelId), {
        ...validChannel,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await setDoc(
        doc(adminDb, 'classForumChannels', channelId, 'messages', 'm-admin-delete'),
        {
          text: 'Old student message',
          senderId: OWNER_UID,
          senderName: 'Owner',
          senderRole: 'user',
          isPinned: false,
          createdAt: new Date(Date.now() - 60_000),
          updatedAt: new Date(Date.now() - 60_000),
        },
      );
    });

    await assertSucceeds(
      deleteDoc(
        doc(
          db(ADMIN_UID),
          'classForumChannels',
          channelId,
          'messages',
          'm-admin-delete',
        ),
      ),
    );
  });
});

describe('unmatched paths', () => {
  test('reads and writes to unknown collections are denied', async () => {
    const database = db(SUPERADMIN_UID);
    await assertFails(getDoc(doc(database, 'secrets', 'doc1')));
    await assertFails(setDoc(doc(database, 'secrets', 'doc1'), { a: 1 }));
  });
});

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

describe('unmatched paths', () => {
  test('reads and writes to unknown collections are denied', async () => {
    const database = db(SUPERADMIN_UID);
    await assertFails(getDoc(doc(database, 'secrets', 'doc1')));
    await assertFails(setDoc(doc(database, 'secrets', 'doc1'), { a: 1 }));
  });
});

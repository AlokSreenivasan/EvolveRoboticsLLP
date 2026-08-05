const { onCall, HttpsError } = require('firebase-functions/v2/https');
const functionsV1 = require('firebase-functions/v1');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

const {
  normalizeAudience,
  normalizeContentTrack,
  normalizeSchoolIds,
  normalizeSchoolGradeIds,
  userMatchesSchoolGradeTarget,
  userMatchesTrackTarget,
  normalizeNotificationCategory,
  resolveUserPreferences,
  collectEligibleTokens,
  buildMulticastMessage,
  sendMulticastBatches,
} = require('./notificationHelpers');
const {
  DEFAULT_QUIZ_XP,
  isAdminRole,
  normalizeChoiceIndex,
  normalizeAnswersMap,
  extractQuestions,
  resolveAnswerKey,
  gradeAnswers,
  computeQuizXpEarned,
  stripQuestionsForPublic,
  extractAnswerKeyFromQuestions,
  questionHasEmbeddedKey,
} = require('./gradingHelpers');

initializeApp();

const FCM_BATCH_SIZE = 500;

async function loadNotificationPreferencesByUser(db) {
  const byUser = new Map();
  const prefsSnap = await db.collectionGroup('notificationPreferences').get();

  prefsSnap.docs.forEach(prefDoc => {
    if (prefDoc.id !== 'current') {
      return;
    }

    const userId = prefDoc.ref.parent?.parent?.id;
    if (typeof userId !== 'string' || userId.length === 0) {
      return;
    }

    byUser.set(userId, resolveUserPreferences(prefDoc.data()));
  });

  return byUser;
}

async function loadAllowedUserIds(
  db,
  targetSchoolIds,
  schoolGradeIds,
  targetTrack,
) {
  const allowed = new Set();

  for (let i = 0; i < targetSchoolIds.length; i += 10) {
    const chunk = targetSchoolIds.slice(i, i + 10);
    const snapshot = await db
      .collection('users')
      .where('schoolId', 'in', chunk)
      .get();

    snapshot.docs.forEach(doc => {
      const userData = doc.data();
      if (
        userMatchesSchoolGradeTarget(userData, schoolGradeIds) &&
        userMatchesTrackTarget(userData, targetTrack)
      ) {
        allowed.add(doc.id);
      }
    });
  }

  return allowed;
}

async function loadAllowedUserIdsByTrack(db, targetTrack) {
  const allowed = new Set();
  const snapshot = await db
    .collection('users')
    .where('track', '==', targetTrack)
    .get();

  snapshot.docs.forEach(doc => {
    allowed.add(doc.id);
  });

  return allowed;
}

/**
 * Callable: admin sends a push notification to registered device tokens.
 * Respects notification audience (all schools vs selected schools) and
 * kids / professionals track targeting.
 * Expects { notificationId, title, body }.
 */
// invoker: 'public' lets Cloud Run accept the request; Firebase Auth is
// still enforced by the request.auth check below.
exports.sendLiveNotification = onCall({ invoker: 'public' }, async request => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const db = getFirestore();
  const adminUid = request.auth.uid;
  const adminSnap = await db.doc(`users/${adminUid}`).get();

  if (!adminSnap.exists || !isAdminRole(adminSnap.data().role)) {
    throw new HttpsError(
      'permission-denied',
      'Only admins can send live notifications.',
    );
  }

  const { notificationId, title, body } = request.data ?? {};

  if (
    typeof notificationId !== 'string' ||
    !notificationId.trim() ||
    typeof title !== 'string' ||
    !title.trim() ||
    typeof body !== 'string' ||
    !body.trim()
  ) {
    throw new HttpsError(
      'invalid-argument',
      'notificationId, title, and body are required.',
    );
  }

  const notificationSnap = await db.doc(`notifications/${notificationId}`).get();
  if (!notificationSnap.exists) {
    throw new HttpsError('not-found', 'Notification not found.');
  }

  const notificationData = notificationSnap.data() ?? {};
  const category = normalizeNotificationCategory(notificationData.category);
  const targetTrack = normalizeContentTrack(notificationData.track);
  const audience = normalizeAudience(notificationData);
  const targetSchoolIds = normalizeSchoolIds(notificationData);
  const schoolGradeIds = normalizeSchoolGradeIds(
    notificationData,
    targetSchoolIds,
  );

  if (audience === 'schools' && targetSchoolIds.length === 0) {
    throw new HttpsError(
      'failed-precondition',
      'This notification has no target schools. Edit it and select schools first.',
    );
  }

  let allowedUserIds = null;
  if (audience === 'schools') {
    allowedUserIds = await loadAllowedUserIds(
      db,
      targetSchoolIds,
      schoolGradeIds,
      targetTrack,
    );
  } else if (targetTrack != null) {
    allowedUserIds = await loadAllowedUserIdsByTrack(db, targetTrack);
  }

  const preferencesByUser = await loadNotificationPreferencesByUser(db);
  const tokenSnap = await db.collectionGroup('fcmTokens').get();
  const { withSound, silent } = collectEligibleTokens(
    tokenSnap,
    preferencesByUser,
    category,
    allowedUserIds,
  );
  const recipientCount = withSound.length + silent.length;

  if (recipientCount === 0) {
    const trackLabel =
      targetTrack === 'kids'
        ? 'kids'
        : targetTrack === 'professionals'
          ? 'professionals'
          : null;
    const trackSuffix = trackLabel ? ` on the ${trackLabel} track` : '';
    throw new HttpsError(
      'failed-precondition',
      audience === 'schools'
        ? category === 'general'
          ? `No devices are registered for learners at the selected schools${trackSuffix}.`
          : `No devices are registered for learners at the selected schools${trackSuffix} with this notification category enabled.`
        : category === 'general'
          ? trackLabel
            ? `No devices are registered for ${trackLabel} learners yet.`
            : 'No devices are registered for push notifications yet.'
          : trackLabel
            ? `No devices are registered for ${trackLabel} learners with this notification category enabled.`
            : 'No devices are registered with this notification category enabled.',
    );
  }

  const messaging = getMessaging();
  const soundMessage = buildMulticastMessage(
    title,
    body,
    notificationId,
    category,
    true,
  );
  const silentMessage = buildMulticastMessage(
    title,
    body,
    notificationId,
    category,
    false,
  );

  const [soundResult, silentResult] = await Promise.all([
    sendMulticastBatches(messaging, withSound, soundMessage, FCM_BATCH_SIZE),
    sendMulticastBatches(messaging, silent, silentMessage, FCM_BATCH_SIZE),
  ]);

  await db.doc(`notifications/${notificationId}`).update({
    lastSentAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    successCount: soundResult.successCount + silentResult.successCount,
    failureCount: soundResult.failureCount + silentResult.failureCount,
    recipientCount,
  };
});

const FIRESTORE_BATCH_LIMIT = 500;

/**
 * Callable: admin resets a user's quiz competition progress.
 * Deletes all documents in users/{targetUserId}/quizAttempts.
 * Expects { targetUserId }.
 */
// invoker: 'public' lets Cloud Run accept the request; Firebase Auth is
// still enforced by the request.auth check below.
exports.resetUserQuizProgress = onCall({ invoker: 'public' }, async request => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const db = getFirestore();
  const adminUid = request.auth.uid;
  const adminSnap = await db.doc(`users/${adminUid}`).get();

  if (!adminSnap.exists || !isAdminRole(adminSnap.data().role)) {
    throw new HttpsError(
      'permission-denied',
      'Only admins can reset quiz progress.',
    );
  }

  const { targetUserId } = request.data ?? {};

  if (typeof targetUserId !== 'string' || !targetUserId.trim()) {
    throw new HttpsError('invalid-argument', 'targetUserId is required.');
  }

  const uid = targetUserId.trim();
  const userSnap = await db.doc(`users/${uid}`).get();

  if (!userSnap.exists) {
    throw new HttpsError('not-found', 'User not found.');
  }

  const attemptsSnap = await db.collection(`users/${uid}/quizAttempts`).get();

  if (attemptsSnap.empty) {
    return { deletedCount: 0 };
  }

  let deletedCount = 0;

  for (let i = 0; i < attemptsSnap.docs.length; i += FIRESTORE_BATCH_LIMIT) {
    const batch = db.batch();
    const chunk = attemptsSnap.docs.slice(i, i + FIRESTORE_BATCH_LIMIT);
    chunk.forEach(attemptDoc => batch.delete(attemptDoc.ref));
    await batch.commit();
    deletedCount += chunk.length;
  }

  return { deletedCount };
});

/**
 * Callable: signed-in user permanently deletes their own Firestore data.
 * Recursively removes users/{uid} and every subcollection
 * (continueLearningProgress, examAttempts, quizAttempts, fcmTokens,
 * notificationPreferences, notificationReads) — the client cannot delete
 * some of these itself because security rules restrict them to the Admin SDK.
 */
// invoker: 'public' lets Cloud Run accept the request; Firebase Auth is
// still enforced by the request.auth check below.
exports.deleteMyAccountData = onCall({ invoker: 'public' }, async request => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const db = getFirestore();
  await db.recursiveDelete(db.doc(`users/${request.auth.uid}`));

  return { ok: true };
});

/**
 * Auth trigger: whenever a Firebase Auth user is deleted (in-app deletion,
 * Firebase console, or Admin SDK), recursively remove users/{uid} and every
 * subcollection (continueLearningProgress, examAttempts, quizAttempts,
 * fcmTokens, notificationPreferences, notificationReads). This is the safety
 * net that guarantees no orphaned Firestore data survives account deletion,
 * even if the deleteMyAccountData callable was skipped or failed.
 * Uses the v1 API because auth.user().onDelete has no v2 equivalent yet.
 */
exports.onAuthUserDeleted = functionsV1.auth.user().onDelete(async user => {
  const db = getFirestore();
  await db.recursiveDelete(db.doc(`users/${user.uid}`));
});

/**
 * Callable: grade and persist an exam attempt server-side.
 * Expects { examId, answers: { [questionId]: 0|1|2|3 } }.
 */
// invoker: 'public' lets Cloud Run accept the request; Firebase Auth is
// still enforced by the request.auth check below.
exports.submitExamAttempt = onCall({ invoker: 'public' }, async request => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const examId =
    typeof request.data?.examId === 'string' ? request.data.examId.trim() : '';
  const answers = normalizeAnswersMap(request.data?.answers);

  if (!examId || examId.length > 200) {
    throw new HttpsError('invalid-argument', 'examId is required.');
  }
  if (answers == null) {
    throw new HttpsError(
      'invalid-argument',
      'answers must be a map of questionId to choice index (0-3).',
    );
  }

  const db = getFirestore();
  const uid = request.auth.uid;
  const examRef = db.doc(`exams/${examId}`);
  const examSnap = await examRef.get();

  if (!examSnap.exists) {
    throw new HttpsError('not-found', 'Exam not found.');
  }

  const examData = examSnap.data() ?? {};
  if (examData.isPublished !== true) {
    throw new HttpsError('failed-precondition', 'This exam is not available.');
  }

  const questions = extractQuestions(examData, examId);
  if (questions.length === 0) {
    throw new HttpsError('failed-precondition', 'This exam has no questions.');
  }

  const keySnap = await db.doc(`examAnswerKeys/${examId}`).get();
  const byQuestionId = resolveAnswerKey(
    questions,
    keySnap.exists ? keySnap.data() : null,
    examData,
    examId,
  );

  if (Object.keys(byQuestionId).length === 0) {
    throw new HttpsError(
      'failed-precondition',
      'Exam answer key is missing. Ask an admin to re-save this exam.',
    );
  }

  const { correctCount, totalQuestions, percentage } = gradeAnswers(
    questions,
    answers,
    byQuestionId,
  );

  const attemptRef = db.collection(`users/${uid}/examAttempts`).doc();
  await attemptRef.set({
    examId,
    examTitle:
      typeof examData.title === 'string' ? examData.title.trim() : '',
    answers,
    correctCount,
    totalQuestions,
    percentage,
    submittedAt: FieldValue.serverTimestamp(),
  });

  return {
    attemptId: attemptRef.id,
    examId,
    correctCount,
    totalQuestions,
    percentage,
  };
});

/**
 * Callable: grade and persist a quiz attempt server-side.
 * Expects { quizId, answers: { [questionId]: 0|1|2|3 } }.
 */
// invoker: 'public' lets Cloud Run accept the request; Firebase Auth is
// still enforced by the request.auth check below.
exports.submitQuizAttempt = onCall({ invoker: 'public' }, async request => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const quizId =
    typeof request.data?.quizId === 'string' ? request.data.quizId.trim() : '';
  const answers = normalizeAnswersMap(request.data?.answers);

  if (!quizId || quizId.length > 200) {
    throw new HttpsError('invalid-argument', 'quizId is required.');
  }
  if (answers == null) {
    throw new HttpsError(
      'invalid-argument',
      'answers must be a map of questionId to choice index (0-3).',
    );
  }

  const db = getFirestore();
  const uid = request.auth.uid;
  const quizRef = db.doc(`quizCompetitions/${quizId}`);
  const quizSnap = await quizRef.get();

  if (!quizSnap.exists) {
    throw new HttpsError('not-found', 'Quiz not found.');
  }

  const quizData = quizSnap.data() ?? {};
  if (quizData.isPublished !== true) {
    throw new HttpsError('failed-precondition', 'This quiz is not available.');
  }

  const questions = extractQuestions(quizData, quizId);
  if (questions.length === 0) {
    throw new HttpsError('failed-precondition', 'This quiz has no questions.');
  }

  const attemptRef = db.doc(`users/${uid}/quizAttempts/${quizId}`);
  const existingSnap = await attemptRef.get();

  if (existingSnap.exists) {
    const existing = existingSnap.data() ?? {};
    const priorPercentage =
      typeof existing.percentage === 'number' ? existing.percentage : 0;
    const allowRetry = quizData.allowRetry === true;
    const canRetryImperfect = priorPercentage < 100;

    if (!allowRetry && !canRetryImperfect) {
      throw new HttpsError(
        'failed-precondition',
        'This quiz does not allow retries after a perfect score.',
      );
    }
  }

  const keySnap = await db.doc(`quizAnswerKeys/${quizId}`).get();
  const byQuestionId = resolveAnswerKey(
    questions,
    keySnap.exists ? keySnap.data() : null,
    quizData,
    quizId,
  );

  if (Object.keys(byQuestionId).length === 0) {
    throw new HttpsError(
      'failed-precondition',
      'Quiz answer key is missing. Ask an admin to re-save this quiz.',
    );
  }

  const { correctCount, totalQuestions, percentage } = gradeAnswers(
    questions,
    answers,
    byQuestionId,
  );

  const xpValue =
    typeof quizData.xpValue === 'number' && Number.isFinite(quizData.xpValue)
      ? Math.max(0, Math.trunc(quizData.xpValue))
      : DEFAULT_QUIZ_XP;
  const xpEarned = computeQuizXpEarned(xpValue, correctCount, totalQuestions);

  await attemptRef.set({
    quizId,
    answers,
    correctCount,
    totalQuestions,
    percentage,
    xpEarned,
    submittedAt: FieldValue.serverTimestamp(),
  });

  return {
    attemptId: quizId,
    quizId,
    correctCount,
    totalQuestions,
    percentage,
    xpEarned,
  };
});

/**
 * Callable: admin one-time migration — move embedded answer keys into
 * examAnswerKeys / quizAnswerKeys and strip them from public docs.
 */
// invoker: 'public' lets Cloud Run accept the request; Firebase Auth is
// still enforced by the request.auth check below.
exports.migrateAnswerKeys = onCall({ invoker: 'public' }, async request => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const db = getFirestore();
  const adminSnap = await db.doc(`users/${request.auth.uid}`).get();

  if (!adminSnap.exists || !isAdminRole(adminSnap.data().role)) {
    throw new HttpsError(
      'permission-denied',
      'Only admins can migrate answer keys.',
    );
  }

  let examsMigrated = 0;
  let quizzesMigrated = 0;

  const examsSnap = await db.collection('exams').get();
  for (const examDoc of examsSnap.docs) {
    const data = examDoc.data() ?? {};
    const questions = extractQuestions(data, examDoc.id);
    const needsStrip =
      questions.some(questionHasEmbeddedKey) ||
      normalizeChoiceIndex(data.correctChoiceIndex) != null;

    const byQuestionId = extractAnswerKeyFromQuestions(
      questions,
      data,
      examDoc.id,
    );

    if (Object.keys(byQuestionId).length === 0 && !needsStrip) {
      continue;
    }

    if (Object.keys(byQuestionId).length > 0) {
      await db.doc(`examAnswerKeys/${examDoc.id}`).set({ byQuestionId });
    }

    if (needsStrip && Array.isArray(data.questions) && data.questions.length > 0) {
      await examDoc.ref.update({
        questions: stripQuestionsForPublic(questions),
        updatedAt: FieldValue.serverTimestamp(),
      });
      examsMigrated += 1;
    } else if (needsStrip) {
      examsMigrated += 1;
    }
  }

  const quizzesSnap = await db.collection('quizCompetitions').get();
  for (const quizDoc of quizzesSnap.docs) {
    const data = quizDoc.data() ?? {};
    const questions = extractQuestions(data, quizDoc.id);
    const needsStrip =
      questions.some(questionHasEmbeddedKey) ||
      normalizeChoiceIndex(data.correctChoiceIndex) != null;

    const byQuestionId = extractAnswerKeyFromQuestions(
      questions,
      data,
      quizDoc.id,
    );

    if (Object.keys(byQuestionId).length === 0 && !needsStrip) {
      continue;
    }

    if (Object.keys(byQuestionId).length > 0) {
      await db.doc(`quizAnswerKeys/${quizDoc.id}`).set({ byQuestionId });
    }

    if (needsStrip) {
      const updates = {
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        updates.questions = stripQuestionsForPublic(questions);
      }

      if ('correctChoiceIndex' in data) {
        updates.correctChoiceIndex = FieldValue.delete();
      }

      await quizDoc.ref.update(updates);
      quizzesMigrated += 1;
    }
  }

  return { examsMigrated, quizzesMigrated };
});

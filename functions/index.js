const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

const FCM_BATCH_SIZE = 500;

function normalizeAudience(data) {
  return data?.audience === 'schools' ? 'schools' : 'all';
}

function normalizeSchoolIds(data) {
  if (!Array.isArray(data?.schoolIds)) {
    return [];
  }

  return [
    ...new Set(
      data.schoolIds
        .filter(id => typeof id === 'string' && id.trim().length > 0)
        .map(id => id.trim()),
    ),
  ];
}

function normalizeSchoolGradeIds(data, targetSchoolIds) {
  const raw = data?.schoolGradeIds;
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }

  const allowedSchools = new Set(targetSchoolIds);
  const result = {};

  for (const [schoolId, gradeIds] of Object.entries(raw)) {
    if (!allowedSchools.has(schoolId) || !Array.isArray(gradeIds)) {
      continue;
    }

    const normalized = [
      ...new Set(
        gradeIds
          .filter(id => typeof id === 'string' && id.trim().length > 0)
          .map(id => id.trim()),
      ),
    ];

    if (normalized.length > 0) {
      result[schoolId] = normalized;
    }
  }

  return result;
}

function userMatchesSchoolGradeTarget(userData, schoolGradeIds) {
  const schoolId =
    typeof userData?.schoolId === 'string' ? userData.schoolId.trim() : '';
  if (!schoolId) {
    return false;
  }

  const gradeIds = schoolGradeIds[schoolId];
  if (!gradeIds || gradeIds.length === 0) {
    return true;
  }

  const grade = typeof userData?.grade === 'string' ? userData.grade.trim() : '';
  return grade.length > 0 && gradeIds.includes(grade);
}

const ANDROID_CHANNEL_DEFAULT = 'evolve_default';
const ANDROID_CHANNEL_SILENT = 'evolve_silent';

const DEFAULT_NOTIFICATION_PREFERENCES = {
  pushNotifications: true,
  soundAndVibration: true,
  courseUpdates: true,
  liveClassReminders: true,
  assignmentDeadlines: true,
  progressAchievements: true,
  securityAlerts: true,
  accountChanges: true,
  appUpdates: false,
  promotionalOffers: false,
  eventsAndWorkshops: true,
};

const CATEGORY_PREFERENCE_KEYS = {
  course_updates: 'courseUpdates',
  live_class_reminders: 'liveClassReminders',
  assignment_deadlines: 'assignmentDeadlines',
  progress_achievements: 'progressAchievements',
  security_alerts: 'securityAlerts',
  account_changes: 'accountChanges',
  app_updates: 'appUpdates',
  events_workshops: 'eventsAndWorkshops',
  promotional_offers: 'promotionalOffers',
};

function normalizeNotificationCategory(value) {
  if (typeof value === 'string' && value in CATEGORY_PREFERENCE_KEYS) {
    return value;
  }

  return 'general';
}

function resolveUserPreferences(storedPrefs) {
  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(storedPrefs ?? {}),
  };
}

function isCategoryEnabledForUser(prefs, category) {
  if (!category || category === 'general') {
    return true;
  }

  const preferenceKey = CATEGORY_PREFERENCE_KEYS[category];
  if (!preferenceKey) {
    return true;
  }

  return prefs[preferenceKey] !== false;
}

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

function collectEligibleTokens(
  tokenSnap,
  preferencesByUser,
  category,
  allowedUserIds,
) {
  const withSound = [];
  const silent = [];
  const seen = new Set();

  tokenSnap.docs.forEach(tokenDoc => {
    const userId = tokenDoc.ref.parent?.parent?.id;
    if (typeof userId !== 'string') {
      return;
    }

    const prefs = resolveUserPreferences(preferencesByUser.get(userId));
    if (prefs.pushNotifications === false) {
      return;
    }

    if (!isCategoryEnabledForUser(prefs, category)) {
      return;
    }

    if (allowedUserIds != null && !allowedUserIds.has(userId)) {
      return;
    }

    const token = tokenDoc.data().token;
    if (typeof token !== 'string' || token.length === 0 || seen.has(token)) {
      return;
    }

    seen.add(token);
    if (prefs.soundAndVibration === false) {
      silent.push(token);
    } else {
      withSound.push(token);
    }
  });

  return { withSound, silent };
}

function buildMulticastMessage(title, body, notificationId, category, withSound) {
  const message = {
    notification: {
      title: title.trim(),
      body: body.trim(),
    },
    data: {
      notificationId: notificationId.trim(),
      type: 'live_notification',
      category,
    },
    android: {
      priority: 'high',
      notification: {
        channelId: withSound ? ANDROID_CHANNEL_DEFAULT : ANDROID_CHANNEL_SILENT,
      },
    },
  };

  if (withSound) {
    message.apns = {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    };
  }

  return message;
}

async function sendMulticastBatches(messaging, tokens, message, batchSize) {
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < tokens.length; i += batchSize) {
    const chunk = tokens.slice(i, i + batchSize);
    const response = await messaging.sendEachForMulticast({
      ...message,
      tokens: chunk,
    });
    successCount += response.successCount;
    failureCount += response.failureCount;
  }

  return { successCount, failureCount };
}

async function loadAllowedUserIds(db, targetSchoolIds, schoolGradeIds) {
  const allowed = new Set();

  for (let i = 0; i < targetSchoolIds.length; i += 10) {
    const chunk = targetSchoolIds.slice(i, i + 10);
    const snapshot = await db
      .collection('users')
      .where('schoolId', 'in', chunk)
      .get();

    snapshot.docs.forEach(doc => {
      if (userMatchesSchoolGradeTarget(doc.data(), schoolGradeIds)) {
        allowed.add(doc.id);
      }
    });
  }

  return allowed;
}

/**
 * Callable: admin sends a push notification to registered device tokens.
 * Respects notification audience (all schools vs selected schools).
 * Expects { notificationId, title, body }.
 */
exports.sendLiveNotification = onCall(async request => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const db = getFirestore();
  const adminUid = request.auth.uid;
  const adminSnap = await db.doc(`users/${adminUid}`).get();

  if (!adminSnap.exists || adminSnap.data().role !== 'superadmin') {
    throw new HttpsError(
      'permission-denied',
      'Only superadmins can send live notifications.',
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

  const allowedUserIds =
    audience === 'schools'
      ? await loadAllowedUserIds(db, targetSchoolIds, schoolGradeIds)
      : null;

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
    throw new HttpsError(
      'failed-precondition',
      audience === 'schools'
        ? category === 'general'
          ? 'No devices are registered for learners at the selected schools.'
          : 'No devices are registered for learners at the selected schools with this notification category enabled.'
        : category === 'general'
          ? 'No devices are registered for push notifications yet.'
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
exports.resetUserQuizProgress = onCall(async request => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const db = getFirestore();
  const adminUid = request.auth.uid;
  const adminSnap = await db.doc(`users/${adminUid}`).get();

  if (!adminSnap.exists || adminSnap.data().role !== 'superadmin') {
    throw new HttpsError(
      'permission-denied',
      'Only superadmins can reset quiz progress.',
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

const DEFAULT_QUIZ_XP = 20;

function isAdminRole(role) {
  return role === 'admin' || role === 'superadmin';
}

function normalizeChoiceIndex(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  const truncated = Math.trunc(value);
  if (truncated < 0 || truncated > 3) {
    return null;
  }
  return truncated;
}

function normalizeAnswersMap(raw) {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const answers = {};
  const entries = Object.entries(raw);
  if (entries.length > 500) {
    return null;
  }

  for (const [questionId, value] of entries) {
    if (typeof questionId !== 'string' || !questionId.trim()) {
      return null;
    }
    const choiceIndex = normalizeChoiceIndex(value);
    if (choiceIndex == null) {
      return null;
    }
    answers[questionId.trim()] = choiceIndex;
  }

  return answers;
}

function extractQuestions(data, docId) {
  if (Array.isArray(data?.questions) && data.questions.length > 0) {
    return data.questions.filter(
      question => question && typeof question.id === 'string' && question.id.trim(),
    );
  }

  // Legacy single-question quiz docs.
  const prompt = typeof data?.prompt === 'string' ? data.prompt.trim() : '';
  const choices = Array.isArray(data?.choices) ? data.choices : [];
  if (!prompt || choices.length < 4) {
    return [];
  }

  return [
    {
      id: `${docId}_legacy_q1`,
      prompt,
      choices,
      correctChoiceIndex: data?.correctChoiceIndex,
    },
  ];
}

function resolveAnswerKey(questions, answerKeyData, contentData, docId) {
  const byQuestionId = {};

  if (
    answerKeyData?.byQuestionId != null &&
    typeof answerKeyData.byQuestionId === 'object' &&
    !Array.isArray(answerKeyData.byQuestionId)
  ) {
    for (const [questionId, value] of Object.entries(answerKeyData.byQuestionId)) {
      const index = normalizeChoiceIndex(value);
      if (typeof questionId === 'string' && questionId.trim() && index != null) {
        byQuestionId[questionId.trim()] = index;
      }
    }
  }

  for (const question of questions) {
    const id = question.id.trim();
    if (byQuestionId[id] != null) {
      continue;
    }
    const fromQuestion = normalizeChoiceIndex(question.correctChoiceIndex);
    if (fromQuestion != null) {
      byQuestionId[id] = fromQuestion;
    }
  }

  // Legacy root-level key on old quiz docs.
  if (
    Object.keys(byQuestionId).length === 0 &&
    questions.length === 1 &&
    contentData
  ) {
    const legacy = normalizeChoiceIndex(contentData.correctChoiceIndex);
    if (legacy != null) {
      byQuestionId[questions[0].id.trim()] = legacy;
    }
  }

  void docId;
  return byQuestionId;
}

function gradeAnswers(questions, answers, byQuestionId) {
  const totalQuestions = questions.length;
  let correctCount = 0;

  for (const question of questions) {
    const questionId = question.id.trim();
    const expected = byQuestionId[questionId];
    if (typeof expected !== 'number') {
      continue;
    }
    if (answers[questionId] === expected) {
      correctCount += 1;
    }
  }

  const percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return { correctCount, totalQuestions, percentage };
}

function computeQuizXpEarned(xpValue, correctCount, totalQuestions) {
  const total = Math.max(0, Math.trunc(totalQuestions));
  const correct = Math.max(0, Math.min(Math.trunc(correctCount), total));
  const maxXp = Math.max(0, Math.trunc(xpValue));
  if (total === 0 || maxXp === 0 || correct !== total) {
    return 0;
  }
  return maxXp;
}

function stripQuestionsForPublic(questions) {
  return questions.map(question => ({
    id: question.id,
    prompt: question.prompt,
    choices: question.choices,
  }));
}

function extractAnswerKeyFromQuestions(questions, contentData, docId) {
  const byQuestionId = {};
  for (const question of questions) {
    const id =
      typeof question?.id === 'string' ? question.id.trim() : `${docId}_legacy_q1`;
    const index = normalizeChoiceIndex(question?.correctChoiceIndex);
    if (index != null) {
      byQuestionId[id] = index;
    }
  }

  if (
    Object.keys(byQuestionId).length === 0 &&
    questions.length <= 1 &&
    contentData
  ) {
    const legacy = normalizeChoiceIndex(contentData.correctChoiceIndex);
    const questionId =
      questions[0]?.id?.trim?.() || `${docId}_legacy_q1`;
    if (legacy != null) {
      byQuestionId[questionId] = legacy;
    }
  }

  return byQuestionId;
}

function questionHasEmbeddedKey(question) {
  return normalizeChoiceIndex(question?.correctChoiceIndex) != null;
}

/**
 * Callable: grade and persist an exam attempt server-side.
 * Expects { examId, answers: { [questionId]: 0|1|2|3 } }.
 */
exports.submitExamAttempt = onCall(async request => {
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
exports.submitQuizAttempt = onCall(async request => {
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
exports.migrateAnswerKeys = onCall(async request => {
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

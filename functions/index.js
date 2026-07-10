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

  if (!adminSnap.exists || adminSnap.data().role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can send live notifications.');
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

  if (!adminSnap.exists || adminSnap.data().role !== 'admin') {
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

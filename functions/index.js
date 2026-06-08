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

  const tokenSnap = await db.collectionGroup('fcmTokens').get();
  const tokens = [
    ...new Set(
      tokenSnap.docs
        .filter(tokenDoc => {
          if (allowedUserIds == null) {
            return true;
          }

          const userId = tokenDoc.ref.parent?.parent?.id;
          return typeof userId === 'string' && allowedUserIds.has(userId);
        })
        .map(doc => doc.data().token)
        .filter(token => typeof token === 'string' && token.length > 0),
    ),
  ];

  if (tokens.length === 0) {
    throw new HttpsError(
      'failed-precondition',
      audience === 'schools'
        ? 'No devices are registered for learners at the selected schools.'
        : 'No devices are registered for push notifications yet.',
    );
  }

  const messaging = getMessaging();
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < tokens.length; i += FCM_BATCH_SIZE) {
    const chunk = tokens.slice(i, i + FCM_BATCH_SIZE);
    const response = await messaging.sendEachForMulticast({
      tokens: chunk,
      notification: {
        title: title.trim(),
        body: body.trim(),
      },
      data: {
        notificationId: notificationId.trim(),
        type: 'live_notification',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'evolve_default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    });

    successCount += response.successCount;
    failureCount += response.failureCount;
  }

  await db.doc(`notifications/${notificationId}`).update({
    lastSentAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    successCount,
    failureCount,
    recipientCount: tokens.length,
  };
});

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

const FCM_BATCH_SIZE = 500;

/**
 * Callable: admin sends a push notification to every registered device token.
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

  const tokenSnap = await db.collectionGroup('fcmTokens').get();
  const tokens = [
    ...new Set(
      tokenSnap.docs
        .map(doc => doc.data().token)
        .filter(token => typeof token === 'string' && token.length > 0),
    ),
  ];

  if (tokens.length === 0) {
    throw new HttpsError(
      'failed-precondition',
      'No devices are registered for push notifications yet.',
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

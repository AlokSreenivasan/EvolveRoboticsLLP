/**
 * Firestore cleanup for deleted Firebase Auth users.
 * Manage Users / Manage Roles read users/{uid} (role is a field on that doc),
 * so Auth-only deletes leave ghosts until this tree is removed.
 */

const USER_SUBCOLLECTIONS = Object.freeze([
  'continueLearningProgress',
  'examAttempts',
  'quizAttempts',
  'fcmTokens',
  'notificationPreferences',
  'notificationReads',
]);

const FIRESTORE_BATCH_LIMIT = 500;
const AUTH_LIST_PAGE_SIZE = 1000;

function collectOrphanedUserIds(firestoreUids, authUids) {
  const authSet = authUids instanceof Set ? authUids : new Set(authUids);
  return firestoreUids.filter(uid => typeof uid === 'string' && !authSet.has(uid));
}

function shouldRefuseOrphanPurge(firestoreCount, authCount) {
  return firestoreCount > 0 && authCount === 0;
}

async function deleteCollectionInBatches(collectionRef, batchLimit = FIRESTORE_BATCH_LIMIT) {
  const db = collectionRef.firestore;

  while (true) {
    const snapshot = await collectionRef.limit(batchLimit).get();
    if (snapshot.empty) {
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();

    if (snapshot.size < batchLimit) {
      return;
    }
  }
}

async function deleteKnownUserSubcollections(db, uid) {
  const userRef = db.doc(`users/${uid}`);

  for (const name of USER_SUBCOLLECTIONS) {
    await deleteCollectionInBatches(userRef.collection(name));
  }

  await userRef.delete();
}

/**
 * Removes users/{uid} and known subcollections. Prefers Admin recursiveDelete,
 * then falls back to explicit subcollection deletes if that API fails.
 */
async function deleteUserFirestoreData(db, uid) {
  const userRef = db.doc(`users/${uid}`);

  try {
    await db.recursiveDelete(userRef);
  } catch (error) {
    console.error(
      `recursiveDelete failed for users/${uid}; falling back to known subcollections`,
      error,
    );
    await deleteKnownUserSubcollections(db, uid);
  }
}

async function listAllAuthUserIds(auth) {
  const uids = new Set();
  let pageToken;

  do {
    const page = await auth.listUsers(AUTH_LIST_PAGE_SIZE, pageToken);
    page.users.forEach(user => {
      if (typeof user.uid === 'string' && user.uid.length > 0) {
        uids.add(user.uid);
      }
    });
    pageToken = page.pageToken;
  } while (pageToken);

  return uids;
}

/**
 * Deletes Firestore user profiles (and roles on those docs) whose Auth account
 * no longer exists. Refuses to run if Auth listing returns zero users while
 * profiles still exist, to avoid wiping the directory on an Auth API failure.
 */
async function purgeOrphanedUserProfiles(db, auth) {
  const authUids = await listAllAuthUserIds(auth);
  const snapshot = await db.collection('users').select().get();
  const firestoreUids = snapshot.docs.map(docSnap => docSnap.id);

  if (shouldRefuseOrphanPurge(firestoreUids.length, authUids.size)) {
    throw new Error(
      'Refusing orphan purge because Firebase Auth returned zero users while Firestore still has profiles.',
    );
  }

  const orphaned = collectOrphanedUserIds(firestoreUids, authUids);

  for (const uid of orphaned) {
    await deleteUserFirestoreData(db, uid);
  }

  return {
    scanned: firestoreUids.length,
    purged: orphaned.length,
  };
}

module.exports = {
  USER_SUBCOLLECTIONS,
  collectOrphanedUserIds,
  shouldRefuseOrphanPurge,
  deleteUserFirestoreData,
  purgeOrphanedUserProfiles,
};

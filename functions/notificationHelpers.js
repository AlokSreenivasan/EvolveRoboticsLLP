/**
 * Pure helpers for sendLiveNotification: audience targeting, notification
 * preferences, token collection, and FCM message construction.
 * Extracted from index.js so they can be unit-tested without firebase-admin.
 */

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

module.exports = {
  ANDROID_CHANNEL_DEFAULT,
  ANDROID_CHANNEL_SILENT,
  DEFAULT_NOTIFICATION_PREFERENCES,
  CATEGORY_PREFERENCE_KEYS,
  normalizeAudience,
  normalizeSchoolIds,
  normalizeSchoolGradeIds,
  userMatchesSchoolGradeTarget,
  normalizeNotificationCategory,
  resolveUserPreferences,
  isCategoryEnabledForUser,
  collectEligibleTokens,
  buildMulticastMessage,
  sendMulticastBatches,
};

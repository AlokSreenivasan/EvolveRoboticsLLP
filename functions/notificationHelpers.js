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
  classForumMessages: true,
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
  class_forum_messages: 'classForumMessages',
};

const FORUM_MESSAGE_PREVIEW_MAX = 120;
const FORUM_NOTIFICATION_TYPE = 'class_forum_message';
const FORUM_NOTIFICATION_CATEGORY = 'class_forum_messages';

function normalizeAudience(data) {
  return data?.audience === 'schools' ? 'schools' : 'all';
}

/**
 * Kids / professionals track from a notification or user doc.
 * Returns null when unset or invalid (legacy docs without track).
 */
function normalizeContentTrack(value) {
  return value === 'kids' || value === 'professionals' ? value : null;
}

/**
 * When the notification targets a track, only users on that track match.
 * Notifications without a track remain visible to every user (legacy).
 */
function userMatchesTrackTarget(userData, targetTrack) {
  if (targetTrack == null) {
    return true;
  }

  return normalizeContentTrack(userData?.track) === targetTrack;
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

function buildMulticastMessage(
  title,
  body,
  notificationId,
  category,
  withSound,
  options,
) {
  const type =
    typeof options?.type === 'string' && options.type.trim().length > 0
      ? options.type.trim()
      : 'live_notification';
  const extraData =
    options?.data != null &&
    typeof options.data === 'object' &&
    !Array.isArray(options.data)
      ? options.data
      : {};

  const data = {
    notificationId: notificationId.trim(),
    type,
    category,
  };

  Object.entries(extraData).forEach(([key, value]) => {
    if (typeof value === 'string' && value.length > 0) {
      data[key] = value;
    }
  });

  const message = {
    notification: {
      title: title.trim(),
      body: body.trim(),
    },
    data,
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

function buildForumMessagePreview(text, maxLen = FORUM_MESSAGE_PREVIEW_MAX) {
  const trimmed = typeof text === 'string' ? text.trim() : '';
  if (!trimmed) {
    return '';
  }
  if (trimmed.length <= maxLen) {
    return trimmed;
  }
  return `${trimmed.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}

function buildForumNotificationCopy(senderName, text, channelTitle) {
  const name =
    typeof senderName === 'string' && senderName.trim().length > 0
      ? senderName.trim()
      : 'Member';
  const title =
    typeof channelTitle === 'string' && channelTitle.trim().length > 0
      ? channelTitle.trim()
      : 'Class Forum';
  const preview = buildForumMessagePreview(text);

  return {
    title,
    body: preview
      ? `${name}: ${preview}`
      : `${name} posted in the class forum`,
  };
}

function buildForumMulticastMessage(
  title,
  body,
  channelId,
  messageId,
  withSound,
) {
  return buildMulticastMessage(
    title,
    body,
    `${channelId}_${messageId}`,
    FORUM_NOTIFICATION_CATEGORY,
    withSound,
    {
      type: FORUM_NOTIFICATION_TYPE,
      data: {
        channelId,
        messageId,
      },
    },
  );
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
  FORUM_NOTIFICATION_TYPE,
  FORUM_NOTIFICATION_CATEGORY,
  normalizeAudience,
  normalizeContentTrack,
  normalizeSchoolIds,
  normalizeSchoolGradeIds,
  userMatchesSchoolGradeTarget,
  userMatchesTrackTarget,
  normalizeNotificationCategory,
  resolveUserPreferences,
  isCategoryEnabledForUser,
  collectEligibleTokens,
  buildMulticastMessage,
  buildForumMessagePreview,
  buildForumNotificationCopy,
  buildForumMulticastMessage,
  sendMulticastBatches,
};

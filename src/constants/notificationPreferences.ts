export type NotificationPreferenceKey =
  | 'pushNotifications'
  | 'soundAndVibration'
  | 'courseUpdates'
  | 'liveClassReminders'
  | 'assignmentDeadlines'
  | 'progressAchievements'
  | 'securityAlerts'
  | 'accountChanges'
  | 'appUpdates'
  | 'promotionalOffers'
  | 'eventsAndWorkshops'
  | 'classForumMessages';

export type NotificationPreferences = Record<
  NotificationPreferenceKey,
  boolean
>;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
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

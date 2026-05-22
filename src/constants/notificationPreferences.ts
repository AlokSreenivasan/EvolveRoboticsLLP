export type NotificationPreferenceKey =
  | 'pushNotifications'
  | 'emailNotifications'
  | 'soundAndVibration'
  | 'courseUpdates'
  | 'liveClassReminders'
  | 'assignmentDeadlines'
  | 'progressAchievements'
  | 'securityAlerts'
  | 'accountChanges'
  | 'appUpdates'
  | 'promotionalOffers'
  | 'eventsAndWorkshops';

export type NotificationPreferences = Record<
  NotificationPreferenceKey,
  boolean
>;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushNotifications: true,
  emailNotifications: true,
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

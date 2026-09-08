import type { NotificationPreferenceKey } from './notificationPreferences';

export type NotificationCategory =
  | 'general'
  | 'course_updates'
  | 'live_class_reminders'
  | 'assignment_deadlines'
  | 'progress_achievements'
  | 'security_alerts'
  | 'account_changes'
  | 'app_updates'
  | 'events_workshops'
  | 'promotional_offers'
  | 'class_forum_messages';

export const DEFAULT_NOTIFICATION_CATEGORY: NotificationCategory = 'general';

export type NotificationCategoryOption = {
  value: NotificationCategory;
  label: string;
  description: string;
  preferenceKey: NotificationPreferenceKey | null;
};

/** Categories exposed in admin when sending live notifications. */
export const ADMIN_NOTIFICATION_CATEGORY_OPTIONS: NotificationCategoryOption[] =
  [
    {
      value: 'general',
      label: 'General',
      description: 'All learners with push notifications enabled',
      preferenceKey: null,
    },
    {
      value: 'app_updates',
      label: 'App updates & tips',
      description: 'Respects the App Updates & Tips preference',
      preferenceKey: 'appUpdates',
    },
    {
      value: 'events_workshops',
      label: 'Events & workshops',
      description: 'Respects the Events & Workshops preference',
      preferenceKey: 'eventsAndWorkshops',
    },
    {
      value: 'promotional_offers',
      label: 'Promotional offers',
      description: 'Respects the Promotional Offers preference',
      preferenceKey: 'promotionalOffers',
    },
  ];

const CATEGORY_PREFERENCE_KEYS: Partial<
  Record<NotificationCategory, NotificationPreferenceKey>
> = {
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

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  general: 'General',
  course_updates: 'Course updates',
  live_class_reminders: 'Live class reminders',
  assignment_deadlines: 'Assignment deadlines',
  progress_achievements: 'Progress & achievements',
  security_alerts: 'Security alerts',
  account_changes: 'Account changes',
  app_updates: 'App updates & tips',
  events_workshops: 'Events & workshops',
  promotional_offers: 'Promotional offers',
  class_forum_messages: 'Class forum messages',
};

export function normalizeNotificationCategory(
  value: unknown,
): NotificationCategory {
  if (
    typeof value === 'string' &&
    value in CATEGORY_LABELS
  ) {
    return value as NotificationCategory;
  }

  return DEFAULT_NOTIFICATION_CATEGORY;
}

export function getNotificationCategoryLabel(
  category: NotificationCategory,
): string {
  return CATEGORY_LABELS[category];
}

export function getPreferenceKeyForCategory(
  category: NotificationCategory,
): NotificationPreferenceKey | null {
  return CATEGORY_PREFERENCE_KEYS[category] ?? null;
}

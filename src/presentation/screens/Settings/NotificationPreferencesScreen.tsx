import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Bell,
  CalendarDays,
  Megaphone,
  Sparkles,
  Volume2,
} from 'lucide-react-native';

import NotificationToggleRow from '../../../components/Settings/NotificationToggleRow';
import SettingsCard from '../../../components/Settings/SettingsCard';
import SettingsInfoCard from '../../../components/Settings/SettingsInfoCard';
import SettingsScreenLayout from '../../../components/Settings/SettingsScreenLayout';
import SettingsSectionHeader from '../../../components/Settings/SettingsSectionHeader';
import { colors, spacing } from '../../../constants/theme';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferenceKey,
  type NotificationPreferences,
} from '../../../constants/notificationPreferences';
import {
  registerDeviceForPushNotifications,
  unregisterDeviceForPushNotifications,
} from '../../../services/firebase/fcmTokenService';
import { syncNotificationPreferencesToFirestore } from '../../../services/firebase/notificationPreferencesFirestoreService';
import {
  hydrateNotificationPreferences,
  loadNotificationPreferences,
  resetNotificationPreferences,
  saveNotificationPreferences,
} from '../../../services/notificationPreferencesStorage';
import { useAuth } from '../../context/AuthContext';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';

function NotificationPreferencesScreen() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadPreferences = () =>
      user?.uid
        ? hydrateNotificationPreferences(user.uid)
        : loadNotificationPreferences();

    loadPreferences().then(stored => {
      if (mounted) {
        setPreferences(stored);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [user?.uid]);

  const persistPreferences = useCallback(
    async (
      next: NotificationPreferences,
      previous: NotificationPreferences,
    ) => {
      setPreferences(next);
      setSaving(true);
      try {
        await saveNotificationPreferences(next);

        if (user?.uid) {
          await syncNotificationPreferencesToFirestore(user.uid, next);

          if (next.pushNotifications && !previous.pushNotifications) {
            await registerDeviceForPushNotifications(user.uid);
          } else if (!next.pushNotifications && previous.pushNotifications) {
            await unregisterDeviceForPushNotifications(user.uid);
          }
        }
      } catch {
        appAlert(
          appAlertCopy.learner.notificationSaveFailedTitle,
          appAlertCopy.learner.notificationSaveFailedMessage,
        );
      } finally {
        setSaving(false);
      }
    },
    [user?.uid],
  );

  const handleToggle = (key: NotificationPreferenceKey, value: boolean) => {
    const previous = preferences;
    const next = { ...preferences, [key]: value };

    if (key === 'pushNotifications' && !value) {
      next.soundAndVibration = false;
    }

    if (key === 'soundAndVibration' && value && !preferences.pushNotifications) {
      next.pushNotifications = true;
    }

    void persistPreferences(next, previous);
  };

  const handleReset = () => {
    appAlert(
      appAlertCopy.learner.resetPreferencesTitle,
      appAlertCopy.learner.resetPreferencesMessage,
      [
        { text: appAlertButtons.cancel, style: 'cancel' },
        {
          text: appAlertButtons.reset,
          onPress: async () => {
            const previousPushEnabled = preferences.pushNotifications;
            setSaving(true);
            try {
              const defaults = await resetNotificationPreferences();
              setPreferences(defaults);

              if (user?.uid) {
                await syncNotificationPreferencesToFirestore(user.uid, defaults);

                if (defaults.pushNotifications && !previousPushEnabled) {
                  await registerDeviceForPushNotifications(user.uid);
                } else if (!defaults.pushNotifications && previousPushEnabled) {
                  await unregisterDeviceForPushNotifications(user.uid);
                }
              }
            } catch {
              appAlert(
                appAlertCopy.learner.resetPreferencesFailedTitle,
                appAlertCopy.learner.resetPreferencesFailedMessage,
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  const pushEnabled = preferences.pushNotifications;

  return (
    <SettingsScreenLayout
      title="Notification Settings"
      backDisabled={saving}
      loading={loading}>
      <SettingsInfoCard
        icon={Bell}
        title="Stay in the loop"
        description="Choose how you receive alerts and updates on your robotics learning journey."
      />

      <View style={styles.sectionBlock}>
        <SettingsSectionHeader
          title="General Notifications"
          actionLabel="Reset to Default"
          onActionPress={handleReset}
        />
        <SettingsCard>
          <NotificationToggleRow
            icon={Bell}
            iconColor={colors.primary}
            iconBackgroundColor={colors.primaryLight}
            title="Push Notifications"
            subtitle="Receive alerts on this device"
            value={preferences.pushNotifications}
            onValueChange={value =>
              handleToggle('pushNotifications', value)
            }
          />
          <NotificationToggleRow
            icon={Volume2}
            iconColor={colors.accentOrange}
            iconBackgroundColor="#FFF3E0"
            title="Sound & Vibration"
            subtitle="Play sounds and vibrate for new alerts"
            value={preferences.soundAndVibration}
            onValueChange={value =>
              handleToggle('soundAndVibration', value)
            }
            disabled={!pushEnabled}
            isLast
          />
        </SettingsCard>
      </View>

      <View style={styles.sectionBlock}>
        <SettingsSectionHeader title="Updates & Events" />
        <SettingsCard>
          <NotificationToggleRow
            icon={Sparkles}
            iconColor={colors.primary}
            iconBackgroundColor={colors.primaryLight}
            title="App Updates & Tips"
            subtitle="New features and learning tips"
            value={preferences.appUpdates}
            onValueChange={value => handleToggle('appUpdates', value)}
            disabled={!pushEnabled}
          />
          <NotificationToggleRow
            icon={CalendarDays}
            iconColor={colors.accentBlue}
            iconBackgroundColor="#E3F2FD"
            title="Events & Workshops"
            subtitle="Robotics competitions, hackathons, and meetups"
            value={preferences.eventsAndWorkshops}
            onValueChange={value =>
              handleToggle('eventsAndWorkshops', value)
            }
            disabled={!pushEnabled}
          />
          <NotificationToggleRow
            icon={Megaphone}
            iconColor={colors.accentOrange}
            iconBackgroundColor="#FFF3E0"
            title="Promotional Offers"
            subtitle="Special programs and partner announcements"
            value={preferences.promotionalOffers}
            onValueChange={value =>
              handleToggle('promotionalOffers', value)
            }
            disabled={!pushEnabled}
            isLast
          />
        </SettingsCard>
      </View>

      {!pushEnabled ? (
        <View style={styles.hintCard}>
          <Text style={styles.hintText}>
            Push notifications are off. Category toggles below will apply
            when you turn push notifications back on.
          </Text>
        </View>
      ) : null}
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  sectionBlock: {
    marginBottom: spacing.sectionGap,
  },
  hintCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  hintText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});

export default NotificationPreferencesScreen;

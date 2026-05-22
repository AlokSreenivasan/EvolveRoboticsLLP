import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Mail,
  Megaphone,
  Shield,
  Sparkles,
  Trophy,
  UserCog,
  Video,
  Volume2,
} from 'lucide-react-native';

import Header from '../../../components/Header.tsx';
import NotificationToggleRow from '../../../components/Settings/NotificationToggleRow';
import SettingsSectionHeader from '../../../components/Settings/SettingsSectionHeader';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferenceKey,
  type NotificationPreferences,
} from '../../../constants/notificationPreferences';
import {
  loadNotificationPreferences,
  resetNotificationPreferences,
  saveNotificationPreferences,
} from '../../../services/notificationPreferencesStorage';
import type { LoginScreenNavigationProp } from '../../../types/navigation';

function NotificationPreferencesScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    loadNotificationPreferences().then(stored => {
      if (mounted) {
        setPreferences(stored);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const persistPreferences = useCallback(
    async (next: NotificationPreferences) => {
      setPreferences(next);
      setSaving(true);
      try {
        await saveNotificationPreferences(next);
      } catch {
        Alert.alert(
          'Save Failed',
          'Could not save your notification preferences. Please try again.',
        );
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const handleToggle = (key: NotificationPreferenceKey, value: boolean) => {
    const next = { ...preferences, [key]: value };

    if (key === 'pushNotifications' && !value) {
      next.soundAndVibration = false;
    }

    if (key === 'soundAndVibration' && value && !preferences.pushNotifications) {
      next.pushNotifications = true;
    }

    void persistPreferences(next);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset to Default',
      'Restore all notification preferences to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            setSaving(true);
            try {
              const defaults = await resetNotificationPreferences();
              setPreferences(defaults);
            } catch {
              Alert.alert(
                'Reset Failed',
                'Could not reset preferences. Please try again.',
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
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={saving}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Header title="Notification Settings" />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a42a8b" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Bell size={22} color="#a42a8b" strokeWidth={2} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoTitle}>Stay in the loop</Text>
              <Text style={styles.infoDescription}>
                Choose how you receive alerts about classes, assignments, and
                account activity on your robotics learning journey.
              </Text>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <SettingsSectionHeader
              title="General Notifications"
              actionLabel="Reset to Default"
              onActionPress={handleReset}
            />
            <View style={styles.card}>
              <NotificationToggleRow
                icon={Bell}
                iconColor="#a42a8b"
                iconBackgroundColor="#FAF2FF"
                title="Push Notifications"
                subtitle="Receive alerts on this device"
                value={preferences.pushNotifications}
                onValueChange={value =>
                  handleToggle('pushNotifications', value)
                }
              />
              <NotificationToggleRow
                icon={Mail}
                iconColor="#4A90E2"
                iconBackgroundColor="#E3F2FD"
                title="Email Notifications"
                subtitle="Get summaries and important updates by email"
                value={preferences.emailNotifications}
                onValueChange={value =>
                  handleToggle('emailNotifications', value)
                }
              />
              <NotificationToggleRow
                icon={Volume2}
                iconColor="#FF9800"
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
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <SettingsSectionHeader title="Learning Alerts" />
            <View style={styles.card}>
              <NotificationToggleRow
                icon={BookOpen}
                iconColor="#4A90E2"
                iconBackgroundColor="#E3F2FD"
                title="Course Updates"
                subtitle="New lessons, materials, and module releases"
                value={preferences.courseUpdates}
                onValueChange={value => handleToggle('courseUpdates', value)}
                disabled={!pushEnabled}
              />
              <NotificationToggleRow
                icon={Video}
                iconColor="#9C27B0"
                iconBackgroundColor="#F3E5F5"
                title="Live Class Reminders"
                subtitle="Reminders before webinars and live sessions"
                value={preferences.liveClassReminders}
                onValueChange={value =>
                  handleToggle('liveClassReminders', value)
                }
                disabled={!pushEnabled}
              />
              <NotificationToggleRow
                icon={ClipboardList}
                iconColor="#FF9800"
                iconBackgroundColor="#FFF3E0"
                title="Assignment Deadlines"
                subtitle="Due dates and submission reminders"
                value={preferences.assignmentDeadlines}
                onValueChange={value =>
                  handleToggle('assignmentDeadlines', value)
                }
                disabled={!pushEnabled}
              />
              <NotificationToggleRow
                icon={Trophy}
                iconColor="#4CAF50"
                iconBackgroundColor="#E8F5E9"
                title="Progress & Achievements"
                subtitle="Milestones, badges, and course completions"
                value={preferences.progressAchievements}
                onValueChange={value =>
                  handleToggle('progressAchievements', value)
                }
                disabled={!pushEnabled}
                isLast
              />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <SettingsSectionHeader title="Account Activity" />
            <View style={styles.card}>
              <NotificationToggleRow
                icon={Shield}
                iconColor="#F44336"
                iconBackgroundColor="#FFEBEE"
                title="Security Alerts"
                subtitle="Sign-in attempts and password changes"
                value={preferences.securityAlerts}
                onValueChange={value => handleToggle('securityAlerts', value)}
              />
              <NotificationToggleRow
                icon={UserCog}
                iconColor="#1a1a2e"
                iconBackgroundColor="#F3F4F6"
                title="Account Changes"
                subtitle="Profile updates and linked account activity"
                value={preferences.accountChanges}
                onValueChange={value => handleToggle('accountChanges', value)}
                isLast
              />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <SettingsSectionHeader title="Updates & Events" />
            <View style={styles.card}>
              <NotificationToggleRow
                icon={Sparkles}
                iconColor="#a42a8b"
                iconBackgroundColor="#FAF2FF"
                title="App Updates & Tips"
                subtitle="New features and learning tips"
                value={preferences.appUpdates}
                onValueChange={value => handleToggle('appUpdates', value)}
                disabled={!pushEnabled}
              />
              <NotificationToggleRow
                icon={CalendarDays}
                iconColor="#4A90E2"
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
                iconColor="#FF9800"
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
            </View>
          </View>

          {!pushEnabled ? (
            <View style={styles.hintCard}>
              <Text style={styles.hintText}>
                Push notifications are off. Learning alert toggles will apply
                when you turn push notifications back on.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: { elevation: 3 },
  default: {},
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  screenHeader: {
    backgroundColor: '#fff',
    height: 80,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 2,
  },
  backText: {
    color: '#a42a8b',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...cardShadow,
  },
  infoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...cardShadow,
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
    color: '#6B7280',
    lineHeight: 19,
  },
});

export default NotificationPreferencesScreen;

import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ContinueLearningCard from '../../../components/Home/ContinueLearningCard';
import HeroBannerCarousel from '../../../components/Home/HeroBannerCarousel';
import HomeBottomTabBar, {
  type HomeTabKey,
} from '../../../components/Home/HomeBottomTabBar';
import HomeHeader from '../../../components/Home/HomeHeader';
import HomeSectionHeader from '../../../components/Home/HomeSectionHeader';
import ImportantUpdatesSection from '../../../components/Home/ImportantUpdatesSection';
import QuickAccessGrid from '../../../components/Home/QuickAccessGrid';
import ScheduleCard from '../../../components/Home/ScheduleCard';
import UpcomingEventsSection from '../../../components/Home/UpcomingEventsSection';
import { TODAYS_SCHEDULE } from '../../../constants/homeScreenData';
import { colors, spacing } from '../../../constants/theme';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { useAdminNavigation } from '../../hooks/useAdminNavigation';
import { useContinueLearningPlaylists } from '../../hooks/useContinueLearningPlaylists';
import { useStoredProfileFullName } from '../../hooks/useStoredProfileFullName';
import { useUserRole } from '../../hooks/useUserRole';

const TAB_BAR_HEIGHT = 64;
const NOTIFICATION_COUNT = 3;

function HomeScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const displayName = useStoredProfileFullName();
  const { profileImage } = useAuth();
  const { isAdmin, roleLoading } = useUserRole();
  const { openAdmin } = useAdminNavigation();
  const { playlists, loading: playlistsLoading } = useContinueLearningPlaylists();

  const handleTabPress = (tab: HomeTabKey) => {
    switch (tab) {
      case 'admin':
        openAdmin();
        break;
      case 'profile':
        navigation.navigate('Profile');
        break;
      case 'notifications':
        navigation.navigate('NotificationPreferences');
        break;
      case 'home':
      default:
        break;
    }
  };

  const scrollBottomPadding = TAB_BAR_HEIGHT + Math.max(insets.bottom, 8) + 16;

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeader
        displayName={displayName}
        profileImage={profileImage}
        notificationCount={NOTIFICATION_COUNT}
        onMenuPress={() => navigation.navigate('Settings')}
        onNotificationsPress={() =>
          navigation.navigate('NotificationPreferences')
        }
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollBottomPadding },
        ]}>
        <HeroBannerCarousel />

        <View style={styles.section}>
          <HomeSectionHeader title="Continue Learning" actionLabel="View All" />
          {playlistsLoading ? (
            <ActivityIndicator
              color={colors.primary}
              style={styles.playlistsLoader}
            />
          ) : playlists.length === 0 ? (
            <Text style={styles.playlistsEmpty}>
              New learning playlists will appear here soon.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}>
              {playlists.map(playlist => (
                <ContinueLearningCard key={playlist.id} playlist={playlist} />
              ))}
            </ScrollView>
          )}
        </View>

        <ImportantUpdatesSection />

        <View style={styles.section}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>Today's Schedule</Text>
            <View style={styles.scheduleDateRow}>
              <Calendar size={14} color={colors.primary} strokeWidth={2} />
              <Text style={styles.scheduleDate}>20 May 2025, Mon</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}>
            {TODAYS_SCHEDULE.map(item => (
              <ScheduleCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <HomeSectionHeader title="Quick Access" />
          <QuickAccessGrid />
        </View>

        <UpcomingEventsSection />
      </ScrollView>

      <View style={styles.tabBarWrap}>
        <HomeBottomTabBar
          activeTab="home"
          notificationCount={NOTIFICATION_COUNT}
          showAdminTab={!roleLoading && isAdmin}
          onTabPress={handleTabPress}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 4,
  },
  section: {
    marginBottom: spacing.sectionGap,
  },
  horizontalList: {
    paddingRight: 4,
  },
  playlistsLoader: {
    marginVertical: 24,
  },
  playlistsEmpty: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scheduleDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scheduleDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;

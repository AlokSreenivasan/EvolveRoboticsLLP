import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ContinueLearningCard from '../../../components/Home/ContinueLearningCard';
import DailyMissionsSection from '../../../components/Home/DailyMissionsSection';
import QuizCompetitionHomePanel from '../../../components/Home/QuizCompetitionHomePanel';
import FloatingChatAssistant from '../../../components/Home/FloatingChatAssistant';
import HomeBottomTabBar, {
  type HomeTabKey,
} from '../../../components/Home/HomeBottomTabBar';
import HomeHeader from '../../../components/Home/HomeHeader';
import HomeSectionHeader from '../../../components/Home/HomeSectionHeader';
import StreakBoardPanel from '../../../components/Home/StreakBoardPanel';
import ImportantUpdatesSection from '../../../components/Home/ImportantUpdatesSection';
import QuickAccessGrid from '../../../components/Home/QuickAccessGrid';
import UpcomingEventsSection from '../../../components/Home/UpcomingEventsSection';
import { HORIZONTAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, spacing } from '../../../constants/theme';
import { isProfileComplete } from '../../../domain/Profile/validation/isProfileComplete';
import type { ContinueLearningPlaylist } from '../../../store/content/types/continueLearningPlaylists.types';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { useHomeFeedFocus, useHomeFeedRefresh } from '../../context/HomeFeedContext';
import { useAdminNavigation } from '../../hooks/useAdminNavigation';
import { useContinueLearningPlaylists } from '../../hooks/useContinueLearningPlaylists';
import { useContinueLearningProgress } from '../../hooks/useContinueLearningProgress';
import { useStoredProfileFullName } from '../../hooks/useStoredProfileFullName';
import { useUserRole } from '../../hooks/useUserRole';
import { isPlaylistInProgress } from '../../../utils/continueLearning/formatVideoProgress';

const TAB_BAR_HEIGHT = 78;

function HomeScreen() {
  useHomeFeedFocus();
  const { refresh, refreshing } = useHomeFeedRefresh();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { profile, profileLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const displayName = useStoredProfileFullName();
  const { isAdmin, roleLoading } = useUserRole();
  const { openAdmin } = useAdminNavigation();
  const { playlists, loading: playlistsLoading } = useContinueLearningPlaylists();
  const {
    getVideosWatched,
    getHasStartedWatching,
    loading: progressLoading,
  } = useContinueLearningProgress();
  const scrollRef = useRef<ScrollView>(null);

  const resumePlaylists = useMemo(
    () =>
      playlists.filter(playlist =>
        isPlaylistInProgress(
          getVideosWatched(playlist.id),
          getHasStartedWatching(playlist.id),
        ),
      ),
    [getHasStartedWatching, getVideosWatched, playlists],
  );

  const showContinueLearningSection =
    !playlistsLoading && !progressLoading && resumePlaylists.length > 0;

  useEffect(() => {
    if (profileLoading || isProfileComplete(profile)) {
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'Profile', params: { requireCompletion: true } }],
    });
  }, [navigation, profile, profileLoading]);

  const handleTabPress = (tab: HomeTabKey) => {
    switch (tab) {
      case 'admin':
        openAdmin();
        break;
      case 'settings':
        navigation.navigate('Settings');
        break;
      case 'todo':
        navigation.navigate('ToDo');
        break;
      case 'learning':
        navigation.navigate('Courses');
        break;
      case 'home':
      default:
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        break;
    }
  };

  const scrollBottomPadding = TAB_BAR_HEIGHT + Math.max(insets.bottom, 8) + 16;

  const renderPlaylist = useCallback(
    ({ item }: { item: ContinueLearningPlaylist }) => (
      <ContinueLearningCard
        playlist={item}
        videosWatched={getVideosWatched(item.id)}
        onPress={() => navigation.navigate('CoursePlaylist', { playlist: item })}
      />
    ),
    [getVideosWatched, navigation],
  );

  const playlistKeyExtractor = useCallback(
    (item: ContinueLearningPlaylist) => item.id,
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeader displayName={displayName} />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollBottomPadding },
        ]}>
        <StreakBoardPanel />

        <View style={styles.section}>
          <QuizCompetitionHomePanel embedded />
          <DailyMissionsSection />
          {showContinueLearningSection ? (
            <View style={styles.continueLearningSection}>
              <HomeSectionHeader
                title="Continue Learning"
                actionLabel="View all"
                onActionPress={() => navigation.navigate('ToDo', { tab: 'learn' })}
              />
              <FlatList
                horizontal
                data={resumePlaylists}
                keyExtractor={playlistKeyExtractor}
                renderItem={renderPlaylist}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                {...HORIZONTAL_LIST_PERF}
              />
            </View>
          ) : null}
        </View>

        <ImportantUpdatesSection />

        <View style={styles.section}>
          <HomeSectionHeader title="Quick access" />
          <QuickAccessGrid />
        </View>

        <UpcomingEventsSection />
      </ScrollView>

      <View style={styles.tabBarWrap}>
        <HomeBottomTabBar
          activeTab="home"
          showAdminTab={!roleLoading && isAdmin}
          onTabPress={handleTabPress}
        />
      </View>

      <FloatingChatAssistant
        onPress={() => navigation.navigate('ChatbotScreen')}
      />
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
    paddingTop: 6,
  },
  section: {
    marginBottom: spacing.sectionGap + 4,
  },
  horizontalList: {
    paddingRight: 4,
    paddingVertical: 8,
  },
  continueLearningSection: {
    marginTop: 22,
  },
  tabBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;

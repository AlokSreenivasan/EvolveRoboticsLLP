import React, { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
import UpcomingEventsSection from '../../../components/Home/UpcomingEventsSection';
import { HORIZONTAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, spacing } from '../../../constants/theme';
import type { ContinueLearningPlaylist } from '../../../store/content/types/continueLearningPlaylists.types';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import { useAdminNavigation } from '../../hooks/useAdminNavigation';
import { useContinueLearningPlaylists } from '../../hooks/useContinueLearningPlaylists';
import { useContinueLearningProgress } from '../../hooks/useContinueLearningProgress';
import { useStoredProfileFullName } from '../../hooks/useStoredProfileFullName';
import { useUserRole } from '../../hooks/useUserRole';

const TAB_BAR_HEIGHT = 64;

function HomeScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const displayName = useStoredProfileFullName();
  const { isAdmin, roleLoading } = useUserRole();
  const { openAdmin } = useAdminNavigation();
  const { playlists, loading: playlistsLoading } = useContinueLearningPlaylists();
  const { getVideosWatched } = useContinueLearningProgress();
  const scrollRef = useRef<ScrollView>(null);

  const handleTabPress = (tab: HomeTabKey) => {
    switch (tab) {
      case 'admin':
        openAdmin();
        break;
      case 'settings':
        navigation.navigate('Settings');
        break;
      case 'courses':
        navigation.navigate('Courses');
        break;
      case 'events':
        scrollRef.current?.scrollToEnd({ animated: true });
        break;
      case 'home':
      default:
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        break;
    }
  };

  const scrollBottomPadding = TAB_BAR_HEIGHT + Math.max(insets.bottom, 8) + 16;

  const renderPlaylist = useCallback(
    ({ item, index }: { item: ContinueLearningPlaylist; index: number }) => (
      <ContinueLearningCard
        playlist={item}
        videosWatched={getVideosWatched(item.id)}
        accentIndex={index}
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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollBottomPadding },
        ]}>
        <HeroBannerCarousel
          onCtaPress={() => navigation.navigate('Courses')}
        />

        <View style={styles.section}>
          <HomeSectionHeader
            title="Continue learning"
            actionLabel="View all"
            onActionPress={() => navigation.navigate('ContinueLearningList')}
          />
          {playlistsLoading ? (
            <ActivityIndicator
              color={colors.primary}
              style={styles.playlistsLoader}
            />
          ) : playlists.length === 0 ? (
            <Text style={styles.playlistsEmpty}>
              New courses will appear here soon.
            </Text>
          ) : (
            <FlatList
              horizontal
              data={playlists}
              keyExtractor={playlistKeyExtractor}
              renderItem={renderPlaylist}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              {...HORIZONTAL_LIST_PERF}
            />
          )}
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
  tabBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;

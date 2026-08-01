import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import CourseLessonRow from '../../../components/Courses/CourseLessonRow';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import ScreenStateCard from '../../../components/ui/ScreenStateCard';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import TactileButton from '../../../components/ui/TactileButton';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import {
  colors,
  secondaryButtonStyle,
  spacing,
  typography,
} from '../../../constants/theme';
import type { YouTubePlaylistVideo } from '../../../store/content/types/youtubePlaylist.types';
import type {
  LoginScreenNavigationProp,
  RootStackParamList,
} from '../../../types/navigation';
import {
  computeProgressPercent,
  formatVideoProgressLabel,
  isVideoUnlocked,
  resolvePlaylistVideoCount,
} from '../../../utils/continueLearning/formatVideoProgress';
import { useContinueLearningProgress } from '../../hooks/useContinueLearningProgress';
import { useYouTubePlaylistVideos } from '../../hooks/useYouTubePlaylistVideos';

type CoursePlaylistRouteProp = RouteProp<RootStackParamList, 'CoursePlaylist'>;

function CoursePlaylistScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<CoursePlaylistRouteProp>();
  const { playlist } = route.params;
  const { progressByPlaylistId, getVideosWatched } =
    useContinueLearningProgress();

  const { videos, loading, error, reload } = useYouTubePlaylistVideos(
    playlist.playlistUrl,
  );

  const watchSecondsByVideoId = useMemo(
    () => progressByPlaylistId[playlist.id]?.watchSecondsByVideoId ?? {},
    [playlist.id, progressByPlaylistId],
  );
  const videosWatched = getVideosWatched(playlist.id);
  const videoCount = resolvePlaylistVideoCount(
    videos.length,
    playlist.videoCount,
  );
  const playlistWithCount = useMemo(
    () =>
      playlist.videoCount === videoCount
        ? playlist
        : { ...playlist, videoCount },
    [playlist, videoCount],
  );
  const progressPercent = useMemo(
    () => computeProgressPercent(videosWatched, videoCount),
    [videoCount, videosWatched],
  );
  const progressLabel = useMemo(
    () => formatVideoProgressLabel(videosWatched, videoCount),
    [videoCount, videosWatched],
  );

  const handleSelectVideo = useCallback(
    (index: number) => {
      if (!isVideoUnlocked(watchSecondsByVideoId, videos, index)) {
        return;
      }

      const video = videos[index];
      if (!video) {
        return;
      }

      navigation.navigate('CourseVideo', {
        playlist: playlistWithCount,
        videoId: video.videoId,
        videoTitle: video.title,
        videoIndex: index,
      });
    },
    [navigation, playlistWithCount, videos, watchSecondsByVideoId],
  );

  const renderVideo = useCallback(
    ({ item, index }: { item: YouTubePlaylistVideo; index: number }) => (
      <CourseLessonRow
        lesson={item}
        index={index}
        isActive={false}
        isLocked={!isVideoUnlocked(watchSecondsByVideoId, videos, index)}
        onPress={() => handleSelectVideo(index)}
      />
    ),
    [handleSelectVideo, videos, watchSecondsByVideoId],
  );

  const keyExtractor = useCallback(
    (item: YouTubePlaylistVideo) => item.videoId,
    [],
  );

  const listHeader = useCallback(
    () => (
      <SurfaceCard elevation="light" style={styles.progressHeader}>
        <View style={styles.progressMeta}>
          <Text style={styles.listHeading}>{progressLabel}</Text>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>
        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: progressPercent,
          }}
          accessibilityLabel={`${progressLabel} watched`}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent === 0 ? 0 : Math.max(progressPercent, 4)}%`,
              },
            ]}
          />
        </View>
      </SurfaceCard>
    ),
    [progressLabel, progressPercent],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={playlist.title}
        subtitle={playlist.subtitle ?? undefined}
        compact
      />

      <View style={styles.listContent}>{listHeader()}</View>

      {loading ? (
        <ScreenStateCard variant="loading" style={styles.stateCard} />
      ) : error ? (
        <View style={styles.messageWrap}>
          <ScreenStateCard
            variant="error"
            title="Could not load playlist"
            message={error}>
            <TactileButton
              variant="secondary"
              onPress={reload}
              style={styles.retryButton}
              accessibilityLabel="Try again">
              <Text style={styles.retryText}>Try again</Text>
            </TactileButton>
          </ScreenStateCard>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={keyExtractor}
          renderItem={renderVideo}
          contentContainerStyle={styles.listBodyContent}
          showsVerticalScrollIndicator={false}
          extraData={{ watchSecondsByVideoId, videosWatched }}
          {...VERTICAL_LIST_PERF}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.screenHorizontal,
  },
  listBodyContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 28,
  },
  progressHeader: {
    marginTop: 14,
    marginBottom: 10,
    padding: 14,
  },
  progressMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  listHeading: {
    ...typography.label,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.primaryMuted,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  stateCard: {
    marginHorizontal: spacing.screenHorizontal,
    marginTop: 16,
  },
  messageWrap: {
    paddingHorizontal: spacing.screenHorizontal,
    marginTop: 8,
  },
  retryButton: {
    ...secondaryButtonStyle,
    marginTop: 12,
    minHeight: 44,
    paddingVertical: 10,
  },
  retryText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 14,
  },
});

export default CoursePlaylistScreen;

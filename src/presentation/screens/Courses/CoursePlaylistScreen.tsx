import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import BackButton from '../../../components/BackButton';
import CourseLessonRow from '../../../components/Courses/CourseLessonRow';
import { colors, spacing } from '../../../constants/theme';
import type { YouTubePlaylistVideo } from '../../../store/content/types/youtubePlaylist.types';
import type {
  LoginScreenNavigationProp,
  RootStackParamList,
} from '../../../types/navigation';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
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
      <View style={styles.progressHeader}>
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
      </View>
    ),
    [progressLabel, progressPercent],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {playlist.title}
          </Text>
          {playlist.subtitle ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {playlist.subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.listContent}>{listHeader()}</View>

      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          style={styles.centeredLoader}
        />
      ) : error ? (
        <View style={styles.messageWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={reload} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  centeredLoader: {
    marginTop: 32,
  },
  messageWrap: {
    padding: spacing.screenHorizontal,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  retryText: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.screenHorizontal,
  },
  listBodyContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 24,
  },
  progressHeader: {
    marginTop: 14,
    marginBottom: 10,
  },
  progressMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  listHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
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
});

export default CoursePlaylistScreen;

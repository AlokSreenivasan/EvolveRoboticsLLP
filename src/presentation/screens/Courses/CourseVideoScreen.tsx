import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import BackButton from '../../../components/BackButton';
import CourseVideoPlayer from '../../../components/Courses/CourseVideoPlayer';
import { colors, spacing } from '../../../constants/theme';
import {
  recordPlaylistVideoProgress,
  recordVideoWatchSeconds,
} from '../../../services/firebase/continueLearningProgressService';
import type {
  LoginScreenNavigationProp,
  RootStackParamList,
} from '../../../types/navigation';
import {
  getVideoWatchSeconds,
  isVideoUnlocked,
  resolvePlaylistVideoCount,
} from '../../../utils/continueLearning/formatVideoProgress';
import { useContinueLearningProgress } from '../../hooks/useContinueLearningProgress';
import { useYouTubePlaylistVideos } from '../../hooks/useYouTubePlaylistVideos';

type CourseVideoRouteProp = RouteProp<RootStackParamList, 'CourseVideo'>;

function CourseVideoScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<CourseVideoRouteProp>();
  const { playlist, videoId, videoTitle, videoIndex } = route.params;
  const { progressByPlaylistId } = useContinueLearningProgress();
  const { videos } = useYouTubePlaylistVideos(playlist.playlistUrl);
  const [sessionWatchSeconds, setSessionWatchSeconds] = useState(0);
  const [isNearEnd, setIsNearEnd] = useState(false);

  const savedWatchSeconds = useMemo(
    () => progressByPlaylistId[playlist.id]?.watchSecondsByVideoId ?? {},
    [playlist.id, progressByPlaylistId],
  );

  const initialWatchSeconds = useMemo(() => {
    const saved = getVideoWatchSeconds(savedWatchSeconds, videoId);
    return Math.max(saved, sessionWatchSeconds);
  }, [savedWatchSeconds, sessionWatchSeconds, videoId]);

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
  const nextVideo = videos[videoIndex + 1];
  const hasNextVideo = Boolean(nextVideo);
  const nextUnlocked =
    hasNextVideo &&
    (isNearEnd ||
      isVideoUnlocked(savedWatchSeconds, videos, videoIndex + 1));
  const canGoNext = hasNextVideo && nextUnlocked;

  useEffect(() => {
    setSessionWatchSeconds(0);
    setIsNearEnd(false);
  }, [videoId]);

  useEffect(() => {
    recordPlaylistVideoProgress(
      playlist.id,
      videoIndex + 1,
      videoCount,
    ).catch(() => undefined);
  }, [playlist.id, videoCount, videoIndex]);

  const handleWatchProgress = useCallback(
    (watchSeconds: number) => {
      setSessionWatchSeconds(previous => Math.max(previous, watchSeconds));

      recordVideoWatchSeconds(
        playlist.id,
        videoId,
        watchSeconds,
        videoIndex + 1,
        videoCount,
      ).catch(() => undefined);
    },
    [playlist.id, videoCount, videoId, videoIndex],
  );

  const handleNearEndChange = useCallback((nearEnd: boolean) => {
    setIsNearEnd(nearEnd);
  }, []);

  const handleNextVideo = useCallback(() => {
    if (!canGoNext || !nextVideo) {
      return;
    }

    navigation.replace('CourseVideo', {
      playlist: playlistWithCount,
      videoId: nextVideo.videoId,
      videoTitle: nextVideo.title,
      videoIndex: videoIndex + 1,
    });
  }, [canGoNext, navigation, nextVideo, playlistWithCount, videoIndex]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle} numberOfLines={1}>
          {playlist.title}
        </Text>
      </View>

      <View style={styles.playerSection}>
        <CourseVideoPlayer
          key={videoId}
          videoId={videoId}
          initialWatchSeconds={initialWatchSeconds}
          onWatchProgress={handleWatchProgress}
          onNearEndChange={handleNearEndChange}
        />
        <View style={styles.playingMeta}>
          <Text style={styles.lessonBadge}>
            Lesson {videoIndex + 1} of {videoCount}
          </Text>
          <Text style={styles.playingTitle}>{videoTitle}</Text>

          {hasNextVideo ? (
            <TouchableOpacity
              style={[
                styles.nextButton,
                !canGoNext && styles.nextButtonDisabled,
              ]}
              onPress={handleNextVideo}
              disabled={!canGoNext}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canGoNext }}
              accessibilityLabel={
                canGoNext
                  ? `Next video: ${nextVideo?.title ?? 'Next lesson'}`
                  : 'Next video locked until 1 minute before this video ends'
              }>
              <Text
                style={[
                  styles.nextButtonText,
                  !canGoNext && styles.nextButtonTextDisabled,
                ]}>
                Next Video
              </Text>
              {!canGoNext ? (
                <Text style={styles.nextHint}>
                  Available in the last minute of this lesson
                </Text>
              ) : (
                <Text style={styles.nextHintEnabled} numberOfLines={1}>
                  {nextVideo?.title}
                </Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
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
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  playerSection: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  playingMeta: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 14,
    paddingBottom: 16,
  },
  lessonBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  playingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 24,
  },
  nextButton: {
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.primaryMuted,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  nextButtonTextDisabled: {
    color: colors.textSecondary,
  },
  nextHint: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    textAlign: 'center',
  },
  nextHintEnabled: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
});

export default CourseVideoScreen;

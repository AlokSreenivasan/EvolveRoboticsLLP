import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import CourseVideoPlayer from '../../../components/Courses/CourseVideoPlayer';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import {
  colors,
  primaryButtonStyle,
  spacing,
  typography,
} from '../../../constants/theme';
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
      <ScreenHeader title={playlist.title} compact />

      <View style={styles.playerSection}>
        <CourseVideoPlayer
          key={videoId}
          videoId={videoId}
          initialWatchSeconds={initialWatchSeconds}
          onWatchProgress={handleWatchProgress}
          onNearEndChange={handleNearEndChange}
        />
        <SurfaceCard elevation="light" style={styles.playingMeta}>
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
        </SurfaceCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  playerSection: {
    flex: 1,
    gap: 12,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 12,
    paddingBottom: 16,
  },
  playingMeta: {
    padding: 16,
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
    ...typography.sectionTitle,
    fontSize: 17,
    lineHeight: 24,
  },
  nextButton: {
    ...primaryButtonStyle,
    marginTop: 18,
    minHeight: 56,
  },
  nextButtonDisabled: {
    backgroundColor: colors.primaryMuted,
  },
  nextButtonText: {
    ...typography.button,
    color: colors.surface,
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

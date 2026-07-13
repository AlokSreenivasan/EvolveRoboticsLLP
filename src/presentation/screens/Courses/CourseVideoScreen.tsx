import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import BackButton from '../../../components/BackButton';
import CourseVideoPlayer from '../../../components/Courses/CourseVideoPlayer';
import { colors, spacing } from '../../../constants/theme';
import {
  recordPlaylistVideoProgress,
  recordVideoWatchSeconds,
} from '../../../services/firebase/continueLearningProgressService';
import type { RootStackParamList } from '../../../types/navigation';
import { getVideoWatchSeconds } from '../../../utils/continueLearning/formatVideoProgress';
import { useContinueLearningProgress } from '../../hooks/useContinueLearningProgress';

type CourseVideoRouteProp = RouteProp<RootStackParamList, 'CourseVideo'>;

function CourseVideoScreen() {
  const route = useRoute<CourseVideoRouteProp>();
  const { playlist, videoId, videoTitle, videoIndex } = route.params;
  const { progressByPlaylistId } = useContinueLearningProgress();
  const [sessionWatchSeconds, setSessionWatchSeconds] = useState(0);

  const savedWatchSeconds =
    progressByPlaylistId[playlist.id]?.watchSecondsByVideoId ?? {};

  const initialWatchSeconds = useMemo(() => {
    const saved = getVideoWatchSeconds(savedWatchSeconds, videoId);
    return Math.max(saved, sessionWatchSeconds);
  }, [savedWatchSeconds, sessionWatchSeconds, videoId]);

  useEffect(() => {
    void recordPlaylistVideoProgress(
      playlist.id,
      videoIndex + 1,
      playlist.videoCount,
    ).catch(() => undefined);
  }, [playlist.id, playlist.videoCount, videoIndex]);

  const handleWatchProgress = useCallback(
    (watchSeconds: number) => {
      setSessionWatchSeconds(previous => Math.max(previous, watchSeconds));

      void recordVideoWatchSeconds(
        playlist.id,
        videoId,
        watchSeconds,
        videoIndex + 1,
        playlist.videoCount,
      ).catch(() => undefined);
    },
    [playlist.id, playlist.videoCount, videoId, videoIndex],
  );

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
        />
        <View style={styles.playingMeta}>
          <Text style={styles.lessonBadge}>
            Lesson {videoIndex + 1} of {playlist.videoCount}
          </Text>
          <Text style={styles.playingTitle}>{videoTitle}</Text>
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
});

export default CourseVideoScreen;

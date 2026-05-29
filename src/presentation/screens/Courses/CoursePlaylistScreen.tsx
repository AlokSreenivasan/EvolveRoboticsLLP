import React, { useCallback, useEffect, useRef, useState } from 'react';
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

import CourseLessonRow from '../../../components/Courses/CourseLessonRow';
import CourseVideoPlayer from '../../../components/Courses/CourseVideoPlayer';
import { colors, spacing } from '../../../constants/theme';
import {
  recordPlaylistVideoEngagement,
  recordPlaylistVideoProgress,
} from '../../../services/firebase/continueLearningProgressService';
import type { YouTubePlaylistVideo } from '../../../store/content/types/youtubePlaylist.types';
import type {
  LoginScreenNavigationProp,
  RootStackParamList,
} from '../../../types/navigation';
import { useYouTubePlaylistVideos } from '../../hooks/useYouTubePlaylistVideos';

type CoursePlaylistRouteProp = RouteProp<RootStackParamList, 'CoursePlaylist'>;

function CoursePlaylistScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<CoursePlaylistRouteProp>();
  const { playlist } = route.params;
  const listRef = useRef<FlatList<YouTubePlaylistVideo>>(null);

  const { videos, loading, error, reload } = useYouTubePlaylistVideos(
    playlist.playlistUrl,
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeVideo =
    activeIndex !== null ? videos[activeIndex] ?? null : null;

  useEffect(() => {
    void recordPlaylistVideoEngagement(playlist.id, playlist.videoCount).catch(
      () => undefined,
    );
  }, [playlist.id, playlist.videoCount]);

  const handleSelectVideo = useCallback(
    (index: number) => {
      setActiveIndex(index);
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
      void recordPlaylistVideoProgress(
        playlist.id,
        index + 1,
        playlist.videoCount,
      ).catch(() => undefined);
    },
    [playlist.id, playlist.videoCount],
  );

  const renderVideo = ({
    item,
    index,
  }: {
    item: YouTubePlaylistVideo;
    index: number;
  }) => (
    <CourseLessonRow
      lesson={item}
      index={index}
      isActive={index === activeIndex}
      onPress={() => handleSelectVideo(index)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
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

      {activeVideo ? (
        <View style={styles.playerSection}>
          <CourseVideoPlayer
            key={activeVideo.videoId}
            videoId={activeVideo.videoId}
          />
          <View style={styles.playingMeta}>
            <Text style={styles.lessonBadge}>
              Lesson {activeIndex! + 1} of {videos.length}
            </Text>
            <Text style={styles.playingTitle}>{activeVideo.title}</Text>
          </View>
        </View>
      ) : null}

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
          ref={listRef}
          data={videos}
          keyExtractor={item => item.videoId}
          renderItem={renderVideo}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={styles.listHeading}>
              {activeVideo ? 'All lessons' : `${videos.length} lessons`}
            </Text>
          }
          showsVerticalScrollIndicator={false}
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
  backButton: {
    paddingVertical: 4,
    paddingRight: 4,
  },
  backText: {
    fontSize: 16,
    color: colors.link,
    fontWeight: '600',
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
  playerSection: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  playingMeta: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: colors.surface,
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
    paddingBottom: 24,
  },
  listHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginVertical: 14,
  },
});

export default CoursePlaylistScreen;

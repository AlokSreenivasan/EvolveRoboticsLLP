import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import YoutubePlayer, { PLAYER_STATES } from 'react-native-youtube-iframe';

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
  const { width } = useWindowDimensions();
  const playerHeight = Math.round((width * 9) / 16);

  const { videos, loading, error, reload } = useYouTubePlaylistVideos(
    playlist.playlistUrl,
  );
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    void recordPlaylistVideoEngagement(playlist.id, playlist.videoCount).catch(
      () => undefined,
    );
  }, [playlist.id, playlist.videoCount]);

  useEffect(() => {
    if (videos.length > 0 && !activeVideoId) {
      setActiveVideoId(videos[0].videoId);
      setPlaying(true);
      void recordPlaylistVideoProgress(
        playlist.id,
        1,
        playlist.videoCount,
      ).catch(() => undefined);
    }
  }, [videos, activeVideoId, playlist.id, playlist.videoCount]);

  const handleSelectVideo = useCallback(
    (video: YouTubePlaylistVideo, index: number) => {
      setActiveVideoId(video.videoId);
      setPlaying(true);
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
  }) => {
    const isActive = item.videoId === activeVideoId;

    return (
      <TouchableOpacity
        style={[styles.videoRow, isActive && styles.videoRowActive]}
        activeOpacity={0.85}
        onPress={() => handleSelectVideo(item, index)}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={`Play ${item.title}`}>
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
        <View style={styles.videoMeta}>
          <Text style={styles.videoIndex}>{index + 1}</Text>
          <Text
            style={[styles.videoTitle, isActive && styles.videoTitleActive]}
            numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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

      {activeVideoId ? (
        <View style={styles.playerWrap}>
          <YoutubePlayer
            height={playerHeight}
            play={playing}
            videoId={activeVideoId}
            onChangeState={state => {
              if (state === PLAYER_STATES.ENDED) {
                setPlaying(false);
              }
              if (state === PLAYER_STATES.PLAYING) {
                setPlaying(true);
              }
            }}
          />
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
          data={videos}
          keyExtractor={item => item.videoId}
          renderItem={renderVideo}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={styles.listHeading}>
              {videos.length} video{videos.length === 1 ? '' : 's'}
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
  playerWrap: {
    backgroundColor: '#000',
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
  videoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  videoRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  thumbnail: {
    width: 120,
    height: 68,
    borderRadius: 8,
    backgroundColor: colors.primaryMuted,
  },
  videoMeta: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  videoIndex: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    minWidth: 20,
  },
  videoTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  videoTitleActive: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
});

export default CoursePlaylistScreen;

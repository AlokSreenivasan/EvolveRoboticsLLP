import React from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BookOpen, Play } from 'lucide-react-native';

import { cardShadow, colors } from '../../constants/theme';
import { recordPlaylistVideoEngagement } from '../../services/firebase/continueLearningProgressService';
import type { ContinueLearningPlaylist } from '../../store/content/types/continueLearningPlaylists.types';
import {
  computeProgressPercent,
  formatVideoProgressLabel,
} from '../../utils/continueLearning/formatVideoProgress';

const CARD_ACCENTS = [
  { progressColor: colors.primary, badgeColor: colors.primaryLight },
  { progressColor: colors.accentGreen, badgeColor: '#E8F5E9' },
  { progressColor: '#9C27B0', badgeColor: '#F3E5F5' },
] as const;

type ContinueLearningCardProps = {
  playlist: ContinueLearningPlaylist;
  videosWatched: number;
  accentIndex?: number;
};

function ContinueLearningCard({
  playlist,
  videosWatched,
  accentIndex = 0,
}: ContinueLearningCardProps) {
  const accent = CARD_ACCENTS[accentIndex % CARD_ACCENTS.length];
  const progress = computeProgressPercent(videosWatched, playlist.videoCount);
  const progressLabel = formatVideoProgressLabel(
    videosWatched,
    playlist.videoCount,
  );

  const handlePlay = () => {
    if (!playlist.playlistUrl) {
      return;
    }
    void recordPlaylistVideoEngagement(playlist.id, playlist.videoCount).catch(
      () => undefined,
    );
    Linking.openURL(playlist.playlistUrl).catch(() => undefined);
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {playlist.imageUri ? (
          <Image source={{ uri: playlist.imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        <View style={[styles.badge, { backgroundColor: accent.badgeColor }]}>
          <Text style={[styles.badgeText, { color: accent.progressColor }]}>
            {progress}%
          </Text>
        </View>
        <TouchableOpacity
          style={styles.playButton}
          activeOpacity={0.85}
          onPress={handlePlay}
          accessibilityRole="button"
          accessibilityLabel={`Open ${playlist.title} playlist`}>
          <Play size={18} color="#fff" fill="#fff" strokeWidth={0} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {playlist.title}
        </Text>
        {playlist.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {playlist.subtitle}
          </Text>
        ) : null}

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: accent.progressColor,
              },
            ]}
          />
        </View>

        <View style={styles.footer}>
          <BookOpen size={14} color={colors.primary} strokeWidth={2} />
          <Text style={styles.videos}>{progressLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginRight: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    ...cardShadow,
  },
  imageWrap: {
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    backgroundColor: colors.primaryMuted,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  playButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  body: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.primaryMuted,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  videos: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default ContinueLearningCard;

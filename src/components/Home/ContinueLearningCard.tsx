import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BookOpen, Play } from 'lucide-react-native';

import { cardShadow, colors } from '../../constants/theme';
import type { ContinueLearningPlaylist } from '../../store/content/types/continueLearningPlaylists.types';
import { formatPlaylistVideoCountLabel } from '../../utils/continueLearning/formatVideoProgress';

type ContinueLearningCardProps = {
  playlist: ContinueLearningPlaylist;
  onPress?: () => void;
  /** Carousel strip on home; full-width stacked cards on the list screen. */
  variant?: 'carousel' | 'list';
};

function ContinueLearningCard({
  playlist,
  onPress,
  variant = 'carousel',
}: ContinueLearningCardProps) {
  const isList = variant === 'list';
  const videoCountLabel = formatPlaylistVideoCountLabel(playlist.videoCount);

  return (
    <TouchableOpacity
      style={[styles.card, isList && styles.cardList]}
      activeOpacity={0.92}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open course ${playlist.title}`}>
      <View style={[styles.media, isList && styles.mediaList]}>
        {playlist.imageUri ? (
          <Image source={{ uri: playlist.imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        <View style={styles.mediaOverlay} />
        <View
          style={[styles.playFab, isList && styles.playFabList]}
          accessibilityElementsHidden>
          <Play
            size={isList ? 22 : 18}
            color="#fff"
            fill="#fff"
            strokeWidth={0}
          />
        </View>
      </View>

      <View style={[styles.body, isList && styles.bodyList]}>
        <Text
          style={[styles.title, isList && styles.titleList]}
          numberOfLines={isList ? 2 : 2}>
          {playlist.title}
        </Text>
        {playlist.subtitle ? (
          <Text
            style={[styles.subtitle, isList && styles.subtitleList]}
            numberOfLines={isList ? 2 : 2}>
            {playlist.subtitle}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <BookOpen
            size={isList ? 15 : 14}
            color={colors.primary}
            strokeWidth={2}
          />
          <Text
            style={[styles.metaText, isList && styles.metaTextList]}
            numberOfLines={1}>
            {videoCountLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginRight: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    ...cardShadow,
  },
  cardList: {
    width: '100%',
    marginRight: 0,
    marginBottom: 16,
  },
  media: {
    height: 128,
    position: 'relative',
  },
  mediaList: {
    height: 156,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    backgroundColor: colors.primaryMuted,
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 46, 0.35)',
  },
  playFab: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  playFabList: {
    bottom: 14,
    right: 14,
    width: 48,
    height: 48,
    borderRadius: 24,
    paddingLeft: 3,
    borderWidth: 3,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  bodyList: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 3,
  },
  titleList: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  subtitleList: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metaTextList: {
    fontSize: 12,
  },
});

export default React.memo(ContinueLearningCard);

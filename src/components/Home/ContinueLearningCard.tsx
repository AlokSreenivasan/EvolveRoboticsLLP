import React from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Play, Youtube } from 'lucide-react-native';

import { cardShadow, colors } from '../../constants/theme';
import type { ContinueLearningPlaylist } from '../../store/content/types/continueLearningPlaylists.types';

type ContinueLearningCardProps = {
  playlist: ContinueLearningPlaylist;
};

function ContinueLearningCard({ playlist }: ContinueLearningCardProps) {
  const handlePlay = () => {
    if (!playlist.playlistUrl) {
      return;
    }
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
        <View style={styles.badge}>
          <Youtube size={12} color={colors.primary} strokeWidth={2} />
          <Text style={styles.badgeText}>Playlist</Text>
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
          <Text style={styles.subtitle} numberOfLines={2}>
            {playlist.subtitle}
          </Text>
        ) : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
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
  },
});

export default ContinueLearningCard;

import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Pause, Play } from 'lucide-react-native';

import { colors } from '../../constants/theme';
import type { YouTubePlaylistVideo } from '../../store/content/types/youtubePlaylist.types';

type CourseLessonRowProps = {
  lesson: YouTubePlaylistVideo;
  index: number;
  isActive: boolean;
  onPress: () => void;
};

function CourseLessonRow({
  lesson,
  index,
  isActive,
  onPress,
}: CourseLessonRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, isActive && styles.rowActive]}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`Lesson ${index + 1}: ${lesson.title}`}>
      <View style={styles.thumbnailWrap}>
        <Image source={{ uri: lesson.thumbnailUrl }} style={styles.thumbnail} />
        <View style={[styles.iconBadge, isActive && styles.iconBadgeActive]}>
          {isActive ? (
            <Pause size={14} color="#fff" strokeWidth={2.5} />
          ) : (
            <Play size={14} color="#fff" fill="#fff" strokeWidth={0} />
          )}
        </View>
      </View>

      <View style={styles.meta}>
        <Text style={[styles.index, isActive && styles.indexActive]}>
          {index + 1}
        </Text>
        <View style={styles.textWrap}>
          <Text
            style={[styles.title, isActive && styles.titleActive]}
            numberOfLines={2}>
            {lesson.title}
          </Text>
          {isActive ? (
            <Text style={styles.playingLabel}>Now playing</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
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
  rowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  thumbnailWrap: {
    position: 'relative',
  },
  thumbnail: {
    width: 112,
    height: 63,
    borderRadius: 8,
    backgroundColor: colors.primaryMuted,
  },
  iconBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 1,
  },
  iconBadgeActive: {
    backgroundColor: colors.primaryDark,
  },
  meta: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  index: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    minWidth: 20,
    paddingTop: 2,
  },
  indexActive: {
    color: colors.primary,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  titleActive: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  playingLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default CourseLessonRow;

import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Lock, Pause, Play } from 'lucide-react-native';

import { colors } from '../../constants/theme';
import type { YouTubePlaylistVideo } from '../../store/content/types/youtubePlaylist.types';

type CourseLessonRowProps = {
  lesson: YouTubePlaylistVideo;
  index: number;
  isActive: boolean;
  isLocked?: boolean;
  onPress: () => void;
};

function CourseLessonRow({
  lesson,
  index,
  isActive,
  isLocked = false,
  onPress,
}: CourseLessonRowProps) {
  return (
    <TouchableOpacity
      style={[
        styles.row,
        isActive && styles.rowActive,
        isLocked && styles.rowLocked,
      ]}
      activeOpacity={isLocked ? 1 : 0.85}
      onPress={isLocked ? undefined : onPress}
      disabled={isLocked}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive, disabled: isLocked }}
      accessibilityLabel={`Lesson ${index + 1}: ${lesson.title}${
        isLocked ? ', locked' : ''
      }`}>
      <View style={styles.thumbnailWrap}>
        <Image
          source={{ uri: lesson.thumbnailUrl }}
          style={[styles.thumbnail, isLocked && styles.thumbnailLocked]}
        />
        <View
          style={[
            styles.iconBadge,
            isActive && styles.iconBadgeActive,
            isLocked && styles.iconBadgeLocked,
          ]}>
          {isLocked ? (
            <Lock size={13} color="#fff" strokeWidth={2.5} />
          ) : isActive ? (
            <Pause size={14} color="#fff" strokeWidth={2.5} />
          ) : (
            <Play size={14} color="#fff" fill="#fff" strokeWidth={0} />
          )}
        </View>
      </View>

      <View style={styles.meta}>
        <Text
          style={[
            styles.index,
            isActive && styles.indexActive,
            isLocked && styles.indexLocked,
          ]}>
          {index + 1}
        </Text>
        <View style={styles.textWrap}>
          <Text
            style={[
              styles.title,
              isActive && styles.titleActive,
              isLocked && styles.titleLocked,
            ]}
            numberOfLines={2}>
            {lesson.title}
          </Text>
          {isActive ? (
            <Text style={styles.playingLabel}>Now playing</Text>
          ) : isLocked ? (
            <Text style={styles.lockedLabel}>
              Finish the previous lesson to unlock
            </Text>
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
  rowLocked: {
    opacity: 0.72,
    backgroundColor: colors.background,
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
  thumbnailLocked: {
    opacity: 0.55,
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
  iconBadgeLocked: {
    backgroundColor: colors.textMuted,
    paddingLeft: 0,
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
  indexLocked: {
    color: colors.textMuted,
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
  titleLocked: {
    color: colors.textSecondary,
  },
  playingLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  lockedLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    lineHeight: 16,
  },
});

export default React.memo(CourseLessonRow);

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Clock } from 'lucide-react-native';

import { cardShadow, colors } from '../../constants/theme';
import type { Course } from '../../store/content/types/courses.types';

type CourseCatalogCardProps = {
  course: Pick<
    Course,
    'title' | 'subtitle' | 'imageUri' | 'durationLabel' | 'description'
  >;
};

function CourseCatalogCard({ course }: CourseCatalogCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.thumbnailWrap}>
        {course.imageUri?.trim() ? (
          <Image
            source={{ uri: course.imageUri.trim() }}
            style={styles.thumbnail}
          />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        {course.subtitle?.trim() ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {course.subtitle.trim()}
          </Text>
        ) : null}
        {course.description?.trim() ? (
          <Text style={styles.description} numberOfLines={2}>
            {course.description.trim()}
          </Text>
        ) : null}
        {course.durationLabel?.trim() ? (
          <View style={styles.durationRow}>
            <Clock size={14} color={colors.primary} strokeWidth={2} />
            <Text style={styles.duration}>{course.durationLabel.trim()}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    ...cardShadow,
  },
  thumbnailWrap: {
    marginRight: 14,
  },
  thumbnail: {
    width: 96,
    height: 72,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.primaryMuted,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 21,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  duration: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default CourseCatalogCard;

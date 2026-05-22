import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BookOpen, Play } from 'lucide-react-native';

import type { ContinueLearningCourse } from '../../constants/homeScreenData';
import { cardShadow, colors } from '../../constants/theme';

type ContinueLearningCardProps = {
  course: ContinueLearningCourse;
};

function ContinueLearningCard({ course }: ContinueLearningCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: course.imageUri }} style={styles.image} />
        <View
          style={[styles.badge, { backgroundColor: course.badgeColor }]}>
          <Text style={[styles.badgeText, { color: course.progressColor }]}>
            {course.progress}%
          </Text>
        </View>
        <TouchableOpacity style={styles.playButton} activeOpacity={0.85}>
          <Play
            size={18}
            color="#fff"
            fill="#fff"
            strokeWidth={0}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {course.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {course.subtitle}
        </Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${course.progress}%`,
                backgroundColor: course.progressColor,
              },
            ]}
          />
        </View>

        <View style={styles.footer}>
          <BookOpen size={14} color={colors.primary} strokeWidth={2} />
          <Text style={styles.lessons}>
            {course.lessonsCompleted}/{course.lessonsTotal} Lessons
          </Text>
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
  lessons: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default ContinueLearningCard;

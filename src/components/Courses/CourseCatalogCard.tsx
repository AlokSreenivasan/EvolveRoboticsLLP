import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BookOpen } from 'lucide-react-native';

import { cardShadow, colors } from '../../constants/theme';
import type { Course } from '../../store/content/types/courses.types';

const CARD_ACCENTS = [
  { badgeColor: colors.primaryLight, accentColor: colors.primary },
  { badgeColor: '#E8F5E9', accentColor: colors.accentGreen },
  { badgeColor: '#F3E5F5', accentColor: '#9C27B0' },
] as const;

type CourseCatalogCardProps = {
  course: Pick<
    Course,
    'title' | 'subtitle' | 'imageUri' | 'durationLabel' | 'description'
  >;
  accentIndex?: number;
  onPress?: () => void;
};

function CourseCatalogCard({
  course,
  accentIndex = 0,
  onPress,
}: CourseCatalogCardProps) {
  const accent = CARD_ACCENTS[accentIndex % CARD_ACCENTS.length];
  const duration = course.durationLabel?.trim();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Course ${course.title}`}>
      <View style={styles.imageWrap}>
        {course.imageUri?.trim() ? (
          <Image
            source={{ uri: course.imageUri.trim() }}
            style={styles.image}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        {duration ? (
          <View style={[styles.badge, { backgroundColor: accent.badgeColor }]}>
            <Text style={[styles.badgeText, { color: accent.accentColor }]}>
              {duration}
            </Text>
          </View>
        ) : null}
        <View style={styles.iconButton} accessibilityElementsHidden>
          <BookOpen size={22} color="#fff" strokeWidth={2} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        {course.subtitle?.trim() ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {course.subtitle.trim()}
          </Text>
        ) : null}
        {course.description?.trim() ? (
          <Text style={styles.description} numberOfLines={3}>
            {course.description.trim()}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    ...cardShadow,
  },
  imageWrap: {
    height: 200,
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
    maxWidth: '70%',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default React.memo(CourseCatalogCard);

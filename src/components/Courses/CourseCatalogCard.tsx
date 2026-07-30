import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BookOpen } from 'lucide-react-native';

import { colors } from '../../constants/theme';
import type { Course } from '../../store/content/types/courses.types';
import SurfaceCard from '../ui/SurfaceCard';

const CARD_ACCENTS = [
  { badgeColor: colors.primaryLight, accentColor: colors.primary },
  { badgeColor: colors.successLight, accentColor: colors.accentGreen },
  { badgeColor: colors.noticeBackground, accentColor: colors.primaryDark },
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
    <SurfaceCard elevation="default" clipped style={styles.card}>
      <TouchableOpacity
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
          <View style={styles.mediaOverlay} />
          {duration ? (
            <View style={[styles.badge, { backgroundColor: accent.badgeColor }]}>
              <Text style={[styles.badgeText, { color: accent.accentColor }]}>
                {duration}
              </Text>
            </View>
          ) : null}
          <View style={styles.iconButton} accessibilityElementsHidden>
            <BookOpen size={20} color="#fff" strokeWidth={2.25} />
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {course.title}
          </Text>
        </View>
      </TouchableOpacity>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: 16,
    borderColor: colors.primaryMuted,
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
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 46, 0.18)',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    maxWidth: '70%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 23,
    letterSpacing: -0.2,
  },
});

export default React.memo(CourseCatalogCard);

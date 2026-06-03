import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { BookOpen, EyeOff } from 'lucide-react-native';

import AdminListRowActions from './AdminListRowActions';
import { adminStyles } from './adminStyles';
import { cardShadow, colors, spacing } from '../../constants/theme';
import type { Course } from '../../store/content/types/courses.types';

const CARD_ACCENTS = [
  { badgeColor: colors.primaryLight, accentColor: colors.primary },
  { badgeColor: '#E8F5E9', accentColor: colors.accentGreen },
  { badgeColor: '#F3E5F5', accentColor: '#9C27B0' },
] as const;

type AdminCourseListCardProps = {
  course: Course;
  accentIndex: number;
  index: number;
  itemCount: number;
  reordering: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function AdminCourseListCard({
  course,
  accentIndex,
  index,
  itemCount,
  reordering,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: AdminCourseListCardProps) {
  const accent = CARD_ACCENTS[accentIndex % CARD_ACCENTS.length];
  const duration = course.durationLabel?.trim();
  const subtitle = course.subtitle?.trim();
  const description = course.description?.trim();
  const imageUri = course.imageUri?.trim();

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <BookOpen size={32} color={colors.primary} strokeWidth={1.75} />
          </View>
        )}
        {duration ? (
          <View style={[styles.durationBadge, { backgroundColor: accent.badgeColor }]}>
            <Text style={[styles.durationText, { color: accent.accentColor }]}>
              {duration}
            </Text>
          </View>
        ) : null}
        {!course.isPublished ? (
          <View style={styles.draftPill}>
            <EyeOff size={12} color={colors.accentOrange} strokeWidth={2.5} />
            <Text style={styles.draftPillText}>Draft</Text>
          </View>
        ) : (
          <View style={styles.livePill}>
            <Text style={styles.livePillText}>Live</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
        <Text style={styles.statusLine}>
          {course.isPublished
            ? 'Visible in the Courses tab'
            : 'Hidden until published'}
        </Text>
      </View>

      <View style={[adminStyles.listRowFooter, styles.actionsFooter]}>
        <AdminListRowActions
          index={index}
          itemCount={itemCount}
          reordering={reordering}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    ...cardShadow,
  },
  imageWrap: {
    height: 148,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    maxWidth: '55%',
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
  },
  draftPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  draftPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentOrange,
  },
  livePill: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  livePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentGreen,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  statusLine: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 4,
  },
  actionsFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 4,
  },
});

export default React.memo(AdminCourseListCard);

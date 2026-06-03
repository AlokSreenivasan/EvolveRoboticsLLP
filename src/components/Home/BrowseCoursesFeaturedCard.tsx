import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowRight, BookOpen, GraduationCap, Play, Sparkles } from 'lucide-react-native';

import { cardShadow, colors } from '../../constants/theme';
import type { ContinueLearningPlaylist } from '../../store/content/types/continueLearningPlaylists.types';
import {
  computeProgressPercent,
  formatVideoProgressLabel,
} from '../../utils/continueLearning/formatVideoProgress';

type BrowseCoursesFeaturedCardProps = {
  playlist?: ContinueLearningPlaylist | null;
  videosWatched?: number;
  onPress?: () => void;
  onBrowsePress?: () => void;
};

function BrowseCoursesFeaturedCard({
  playlist,
  videosWatched = 0,
  onPress,
  onBrowsePress,
}: BrowseCoursesFeaturedCardProps) {
  if (!playlist) {
    return (
      <TouchableOpacity
        style={styles.promoCard}
        activeOpacity={0.92}
        onPress={onBrowsePress}
        disabled={!onBrowsePress}
        accessibilityRole="button"
        accessibilityLabel="Browse all courses">
        <View style={styles.promoGlow} />
        <View style={styles.promoContent}>
          <View style={styles.promoBadge}>
            <Sparkles size={14} color={colors.primary} strokeWidth={2.5} />
            <Text style={styles.promoBadgeText}>Featured</Text>
          </View>
          <Text style={styles.promoTitle}>
            Explore. Learn.{'\n'}
            <Text style={styles.promoTitleAccent}>Build. Innovate.</Text>
          </Text>
          <Text style={styles.promoSubtitle}>
            Advance your robotics skills with expert-led courses and hands-on
            projects.
          </Text>
          <View style={styles.promoCta}>
            <GraduationCap size={18} color="#fff" strokeWidth={2} />
            <Text style={styles.promoCtaText}>Browse Courses</Text>
            <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const progress = computeProgressPercent(videosWatched, playlist.videoCount);
  const progressLabel = formatVideoProgressLabel(
    videosWatched,
    playlist.videoCount,
  );
  const hasProgress = progress > 0;
  const ctaLabel = hasProgress ? 'Continue learning' : 'Start course';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open course ${playlist.title}`}>
      <View style={styles.media}>
        {playlist.imageUri ? (
          <Image source={{ uri: playlist.imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        <View style={styles.mediaOverlay} />
        <View style={styles.mediaTopRow}>
          <View style={styles.chip}>
            <Sparkles size={12} color={colors.primary} strokeWidth={2.5} />
            <Text style={styles.chipText}>
              {hasProgress ? 'In progress' : 'New course'}
            </Text>
          </View>
          <View style={styles.progressPill}>
            <Text style={styles.progressPillText}>{progress}%</Text>
          </View>
        </View>
        <View style={styles.playFab} accessibilityElementsHidden>
          <Play size={22} color="#fff" fill="#fff" strokeWidth={0} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {playlist.title}
        </Text>
        {playlist.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {playlist.subtitle}
          </Text>
        ) : null}

        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${Math.max(progress, 4)}%` }]}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.meta}>
            <BookOpen size={15} color={colors.primary} strokeWidth={2} />
            <Text style={styles.metaText}>{progressLabel}</Text>
          </View>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>{ctaLabel}</Text>
            <ArrowRight size={16} color={colors.primary} strokeWidth={2.5} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    ...cardShadow,
  },
  media: {
    height: 156,
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
    backgroundColor: 'rgba(26, 26, 46, 0.35)',
  },
  mediaTopRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.2,
  },
  progressPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  playFab: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.primaryMuted,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  meta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  promoCard: {
    width: '100%',
    minHeight: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    ...cardShadow,
  },
  promoGlow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(238, 205, 244, 0.35)',
  },
  promoContent: {
    padding: 22,
    paddingTop: 24,
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  promoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.heroHighlight,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 28,
    marginBottom: 10,
  },
  promoTitleAccent: {
    color: colors.heroHighlight,
  },
  promoSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 19,
    marginBottom: 18,
    maxWidth: '92%',
  },
  promoCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
  },
  promoCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

export default React.memo(BrowseCoursesFeaturedCard);

import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';

import { cardShadow, colors } from '../../constants/theme';

export type HomeFeaturePanelProps = {
  badgeLabel: string;
  categoryLabel: string;
  categoryIcon?: React.ReactNode;
  title: string;
  subtitle?: string | null;
  metaLabel?: string | null;
  ctaLabel: string;
  imageUri?: string | null;
  imageFallback?: React.ReactNode;
  onPress?: () => void;
  onCtaPress?: () => void;
  ctaDisabled?: boolean;
  accessibilityLabel?: string;
};

function HomeFeaturePanel({
  badgeLabel,
  categoryLabel,
  categoryIcon,
  title,
  subtitle,
  metaLabel,
  ctaLabel,
  imageUri,
  imageFallback,
  onPress,
  onCtaPress,
  ctaDisabled = false,
  accessibilityLabel,
}: HomeFeaturePanelProps) {
  return (
    <View style={styles.card}>
      <View style={styles.glow} pointerEvents="none" />

      <TouchableOpacity
        style={styles.mainPress}
        activeOpacity={onPress ? 0.92 : 1}
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}>
        <View style={styles.row}>
          <View style={styles.thumbnail}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.thumbnailImage} />
            ) : (
              imageFallback ?? <View style={styles.thumbnailPlaceholder} />
            )}
          </View>

          <View style={styles.body}>
            <View style={styles.eyebrow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText} numberOfLines={1}>
                  {badgeLabel}
                </Text>
              </View>
              {categoryLabel ? (
                <>
                  <View style={styles.eyebrowDot} />
                  <View style={styles.categoryRow}>
                    {categoryIcon}
                    <Text style={styles.categoryText} numberOfLines={1}>
                      {categoryLabel}
                    </Text>
                  </View>
                </>
              ) : null}
            </View>

            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>

            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}

            {metaLabel ? (
              <Text style={styles.meta} numberOfLines={1}>
                {metaLabel}
              </Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.cta,
            ctaDisabled ? styles.ctaDisabled : styles.ctaActive,
          ]}
          activeOpacity={ctaDisabled ? 1 : 0.85}
          onPress={onCtaPress}
          disabled={!onCtaPress || ctaDisabled}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
          accessibilityState={{ disabled: ctaDisabled }}>
          <Text
            style={[
              styles.ctaText,
              ctaDisabled ? styles.ctaTextDisabled : styles.ctaTextActive,
            ]}
            numberOfLines={1}>
            {ctaLabel}
          </Text>
          {!ctaDisabled ? (
            <ArrowRight size={14} color={colors.primary} strokeWidth={2.5} />
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    overflow: 'hidden',
    ...cardShadow,
  },
  mainPress: {
    marginBottom: 12,
  },
  glow: {
    position: 'absolute',
    top: -28,
    right: -18,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(238, 205, 244, 0.45)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    flex: 1,
    backgroundColor: colors.primaryMuted,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  eyebrowDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    flexShrink: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 21,
    paddingRight: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
  },
  meta: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    lineHeight: 15,
    marginTop: 2,
  },
  cta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  ctaActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  ctaDisabled: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.15,
  },
  ctaTextActive: {
    color: colors.primary,
  },
  ctaTextDisabled: {
    color: colors.textMuted,
  },
});

export default React.memo(HomeFeaturePanel);

import React, { useCallback, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

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
  /** Optional decorative illustration on the right of the content row. */
  illustration?: React.ReactNode;
  onPress?: () => void;
  onCtaPress?: () => void;
  ctaDisabled?: boolean;
  accessibilityLabel?: string;
};

function CardWaveBackdrop({ width }: { width: number }) {
  if (width <= 0) {
    return null;
  }

  const height = 80;

  return (
    <View style={styles.waveWrap} pointerEvents="none">
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path
          d={`M0 ${height * 0.52} C${width * 0.18} ${height * 0.22} ${width * 0.32} ${height * 0.72} ${width * 0.48} ${height * 0.42} C${width * 0.64} ${height * 0.16} ${width * 0.78} ${height * 0.58} ${width} ${height * 0.34} L${width} ${height} L0 ${height} Z`}
          fill={colors.primaryMuted}
          opacity="0.45"
        />
        <Path
          d={`M0 ${height * 0.68} C${width * 0.2} ${height * 0.42} ${width * 0.36} ${height * 0.82} ${width * 0.52} ${height * 0.56} C${width * 0.7} ${height * 0.32} ${width * 0.84} ${height * 0.7} ${width} ${height * 0.52} L${width} ${height} L0 ${height} Z`}
          fill={colors.primaryLight}
          opacity="0.95"
        />
      </Svg>
    </View>
  );
}

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
  illustration,
  onPress,
  onCtaPress,
  ctaDisabled = false,
  accessibilityLabel,
}: HomeFeaturePanelProps) {
  const [cardWidth, setCardWidth] = useState(0);

  const onCardLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    setCardWidth(prev => (prev === nextWidth ? prev : nextWidth));
  }, []);

  return (
    <View style={styles.card} onLayout={onCardLayout}>
      <CardWaveBackdrop width={cardWidth} />
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

          {illustration ? (
            <View style={styles.illustrationWrap}>{illustration}</View>
          ) : null}
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
            <ArrowRight size={16} color="#fff" strokeWidth={2.5} />
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    overflow: 'hidden',
    ...cardShadow,
  },
  waveWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  mainPress: {
    marginBottom: 14,
  },
  glow: {
    position: 'absolute',
    top: -24,
    right: -12,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(238, 205, 244, 0.4)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 16,
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
  illustrationWrap: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -4,
    marginTop: -4,
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.4,
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
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  cta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 16,
  },
  ctaActive: {
    backgroundColor: colors.primary,
  },
  ctaDisabled: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.15,
  },
  ctaTextActive: {
    color: '#fff',
  },
  ctaTextDisabled: {
    color: colors.textMuted,
  },
});

export default React.memo(HomeFeaturePanel);

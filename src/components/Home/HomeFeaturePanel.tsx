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

import { colors, homeAccents, spacing } from '../../constants/theme';
import CardShadowShell from '../ui/CardShadowShell';
import TactileButton from '../ui/TactileButton';

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

  const height = 88;

  return (
    <View style={styles.waveWrap} pointerEvents="none">
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path
          d={`M0 ${height * 0.52} C${width * 0.18} ${height * 0.22} ${width * 0.32} ${height * 0.72} ${width * 0.48} ${height * 0.42} C${width * 0.64} ${height * 0.16} ${width * 0.78} ${height * 0.58} ${width} ${height * 0.34} L${width} ${height} L0 ${height} Z`}
          fill={homeAccents.quiz.muted}
          opacity="0.45"
        />
        <Path
          d={`M0 ${height * 0.68} C${width * 0.2} ${height * 0.42} ${width * 0.36} ${height * 0.82} ${width * 0.52} ${height * 0.56} C${width * 0.7} ${height * 0.32} ${width * 0.84} ${height * 0.7} ${width} ${height * 0.52} L${width} ${height} L0 ${height} Z`}
          fill={homeAccents.quiz.soft}
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

  const ctaInactive = !onCtaPress || ctaDisabled;

  return (
    <CardShadowShell
      innerStyle={styles.cardInner}
      borderRadius={spacing.cardRadiusLg}
      onLayout={onCardLayout}>
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
        <TactileButton
          style={styles.cta}
          faceColor={
            ctaInactive ? homeAccents.quiz.soft : homeAccents.quiz.accent
          }
          edgeColor={
            ctaInactive
              ? homeAccents.quiz.muted
              : homeAccents.quiz.accentDark
          }
          borderColor="transparent"
          onPress={onCtaPress}
          disabled={ctaInactive}
          accessibilityLabel={ctaLabel}>
          <Text
            style={[
              styles.ctaText,
              ctaInactive ? styles.ctaTextDisabled : styles.ctaTextFilled,
            ]}
            numberOfLines={1}>
            {ctaLabel}
          </Text>
          {!ctaInactive ? (
            <View style={styles.ctaIconWrap}>
              <ArrowRight size={18} color={colors.surface} strokeWidth={2.4} />
            </View>
          ) : null}
        </TactileButton>
      </View>
    </CardShadowShell>
  );
}

const styles = StyleSheet.create({
  cardInner: {
    padding: 16,
    borderColor: homeAccents.quiz.muted,
  },
  waveWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 88,
  },
  mainPress: {
    marginBottom: 14,
  },
  glow: {
    position: 'absolute',
    top: -28,
    right: -16,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: homeAccents.quiz.glow,
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
    backgroundColor: homeAccents.quiz.soft,
    borderWidth: 1,
    borderColor: homeAccents.quiz.muted,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    flex: 1,
    backgroundColor: homeAccents.quiz.muted,
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
    backgroundColor: homeAccents.quiz.soft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: homeAccents.quiz.muted,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: homeAccents.quiz.accent,
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
    letterSpacing: -0.2,
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
    minHeight: 48,
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  ctaIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  ctaTextFilled: {
    color: colors.surface,
  },
  ctaTextDisabled: {
    color: colors.textMuted,
    textTransform: 'none',
    letterSpacing: 0.15,
  },
});

export default React.memo(HomeFeaturePanel);

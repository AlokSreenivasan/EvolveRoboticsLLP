import React, { useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  colors,
  homeAccents,
  primaryButtonStyle,
  spacing,
  typography,
} from '../../constants/theme';
import TactileButton from '../ui/TactileButton';
import LevelBadgeIllustration from './icons/LevelBadgeIllustration';
import RoboticsTrophyIcon from './icons/RoboticsTrophyIcon';
import Svg, { Path } from 'react-native-svg';

const CONFETTI_COLORS = [
  homeAccents.streak.top,
  homeAccents.streak.highlight,
  homeAccents.streak.wave,
  colors.surface,
  homeAccents.streak.gold,
  homeAccents.streak.mint,
];

type LevelAchievementBannerProps = {
  visible: boolean;
  level: number;
  rank: string;
  firstName: string;
  onClose: () => void;
};

type ConfettiSpec = {
  leftPct: number;
  delay: number;
  duration: number;
  drift: number;
  color: string;
  width: number;
  height: number;
  rotate: number;
};

function ConfettiPiece({
  spec,
  burstKey,
  containerWidth,
}: {
  spec: ConfettiSpec;
  burstKey: number;
  containerWidth: number;
}) {
  const progress = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    spin.value = 0;
    progress.value = withDelay(
      spec.delay,
      withTiming(1, {
        duration: spec.duration,
        easing: Easing.out(Easing.quad),
      }),
    );
    spin.value = withDelay(
      spec.delay,
      withTiming(spec.rotate, { duration: spec.duration }),
    );

    return () => {
      cancelAnimation(progress);
      cancelAnimation(spin);
    };
  }, [burstKey, progress, spec.delay, spec.duration, spec.rotate, spin]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateY: progress.value * 260 },
      { translateX: progress.value * spec.drift },
      { rotate: `${spin.value}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.confetti,
        {
          left: (spec.leftPct / 100) * containerWidth,
          width: spec.width,
          height: spec.height,
          backgroundColor: spec.color,
        },
        style,
      ]}
    />
  );
}

function makeConfetti(): ConfettiSpec[] {
  return Array.from({ length: 24 }, (_, index) => ({
    leftPct: 6 + ((index * 19) % 88),
    delay: (index % 8) * 36,
    duration: 1280 + (index % 5) * 160,
    drift: (index % 2 === 0 ? 1 : -1) * (10 + (index % 7) * 7),
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    width: 5 + (index % 4),
    height: 7 + (index % 5),
    rotate: 140 + index * 16,
  }));
}

function LevelAchievementBanner({
  visible,
  level,
  rank,
  firstName,
  onClose,
}: LevelAchievementBannerProps) {
  const [burstKey, setBurstKey] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const confetti = useMemo(() => makeConfetti(), [burstKey]);

  const cardEnter = useSharedValue(0);
  const badgeScale = useSharedValue(0.35);
  const badgeFloat = useSharedValue(0);
  const raysRotate = useSharedValue(0);
  const shine = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      cancelAnimation(cardEnter);
      cancelAnimation(badgeScale);
      cancelAnimation(badgeFloat);
      cancelAnimation(raysRotate);
      cancelAnimation(shine);
      cardEnter.value = 0;
      badgeScale.value = 0.35;
      return;
    }

    setBurstKey(key => key + 1);
    cardEnter.value = withSpring(1, { damping: 16, stiffness: 180 });
    badgeScale.value = withDelay(
      120,
      withSpring(1, { damping: 10, stiffness: 220 }),
    );
    badgeFloat.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(-7, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
    raysRotate.value = withRepeat(
      withTiming(360, { duration: 18000, easing: Easing.linear }),
      -1,
      false,
    );
    shine.value = withDelay(
      280,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 0 }),
          withTiming(0, { duration: 2200 }),
        ),
        -1,
        false,
      ),
    );

    return () => {
      cancelAnimation(cardEnter);
      cancelAnimation(badgeScale);
      cancelAnimation(badgeFloat);
      cancelAnimation(raysRotate);
      cancelAnimation(shine);
    };
  }, [badgeFloat, badgeScale, cardEnter, raysRotate, shine, visible]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardEnter.value,
    transform: [
      { translateY: interpolate(cardEnter.value, [0, 1], [36, 0]) },
      { scale: interpolate(cardEnter.value, [0, 1], [0.92, 1]) },
    ],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: badgeFloat.value },
      { scale: badgeScale.value },
    ],
  }));

  const raysStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${raysRotate.value}deg` }],
  }));

  const shineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shine.value, [0, 0.35, 1], [0, 0.55, 0]),
    transform: [{ translateX: interpolate(shine.value, [0, 1], [-160, 220]) }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.card, cardStyle]}
          accessibilityViewIsModal
          accessibilityRole="alert"
          accessibilityLabel={`Level complete. ${firstName} reached level ${level}, ${rank}.`}
          onLayout={event => {
            const nextWidth = Math.round(event.nativeEvent.layout.width);
            if (nextWidth > 0 && nextWidth !== cardWidth) {
              setCardWidth(nextWidth);
            }
          }}>
          <View style={styles.hex} />
          <Animated.View pointerEvents="none" style={[styles.rays, raysStyle]}>
            {Array.from({ length: 10 }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.ray,
                  { transform: [{ rotate: `${index * 18}deg` }] },
                ]}
              />
            ))}
          </Animated.View>
          <Animated.View pointerEvents="none" style={[styles.shine, shineStyle]} />

          {cardWidth > 0
            ? confetti.map((spec, index) => (
                <ConfettiPiece
                  key={`${burstKey}-${index}`}
                  spec={spec}
                  burstKey={burstKey}
                  containerWidth={cardWidth}
                />
              ))
            : null}

          <View style={styles.content}>
            <Text style={styles.kicker}>Level complete</Text>
            <Animated.View style={[styles.badgeWrap, badgeStyle]}>
              <LevelBadgeIllustration size={118} />
              <View style={styles.trophyBadge} pointerEvents="none">
                <RoboticsTrophyIcon size={36} />
              </View>
            </Animated.View>
            <Text style={styles.title}>You reached Level {level}!</Text>
            <Text style={styles.message}>
              {firstName}, that was a real step forward. Keep stacking skills —
              your next challenge is waiting.
            </Text>
            <View style={styles.chips}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Rank: {rank}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Reward unlocked</Text>
              </View>
            </View>
          </View>

          {cardWidth > 0 ? (
            <Svg
              style={styles.wave}
              width={cardWidth}
              height={72}
              viewBox="0 0 720 78"
              preserveAspectRatio="none">
              <Path
                d="M0 38c60 22 120-18 180-8s120 34 180 18 120-36 180-18 90 28 180 8v40H0z"
                fill={homeAccents.streak.wave}
              />
              <Path
                d="M0 50c70 16 110-12 180-4s130 24 180 8 110-24 180-8 110 20 180 8v24H0z"
                fill={homeAccents.streak.waveDeep}
              />
            </Svg>
          ) : null}

          <View style={styles.actions}>
            <TactileButton
              variant="secondary"
              accessibilityLabel="Close level achievement"
              onPress={onClose}
              style={primaryButtonStyle}>
              <Text style={styles.closeText}>Awesome</Text>
            </TactileButton>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlayScrim,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenHorizontal,
  },
  card: {
    borderRadius: spacing.cardRadiusXl,
    overflow: 'hidden',
    backgroundColor: homeAccents.streak.bottom,
    minHeight: 420,
  },
  hex: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: homeAccents.streak.top,
    opacity: 0.58,
  },
  rays: {
    position: 'absolute',
    top: -40,
    left: '50%',
    marginLeft: -140,
    width: 280,
    height: 280,
    opacity: 0.22,
  },
  ray: {
    position: 'absolute',
    top: 0,
    left: 136,
    width: 8,
    height: 280,
    backgroundColor: homeAccents.streak.highlight,
    opacity: 0.35,
  },
  shine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 72,
    backgroundColor: colors.primaryLight,
    opacity: 0.22,
    transform: [{ rotate: '18deg' }],
    zIndex: 3,
  },
  content: {
    zIndex: 2,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 108,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.primaryMuted,
    marginBottom: 8,
  },
  badgeWrap: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  trophyBadge: {
    position: 'absolute',
    right: 4,
    bottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.screenTitle,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    ...typography.body,
    color: colors.primaryLight,
    textAlign: 'center',
    maxWidth: 420,
    marginBottom: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    borderRadius: spacing.chipRadius,
    borderWidth: 1,
    borderColor: colors.noticeBorder,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  wave: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  actions: {
    position: 'absolute',
    left: spacing.screenHorizontal,
    right: spacing.screenHorizontal,
    bottom: spacing.screenHorizontal,
    zIndex: 4,
  },
  closeText: {
    ...typography.button,
    color: colors.primary,
  },
  confetti: {
    position: 'absolute',
    top: 48,
    borderRadius: 2,
    zIndex: 5,
  },
});

export default LevelAchievementBanner;

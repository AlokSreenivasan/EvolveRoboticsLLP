import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors, spacing, typography } from '../../constants/theme';

const WISHES = [
  'May your year be packed with bright ideas, kind teammates, and robots that actually do what you coded.',
  'Another trip around the sun — keep stacking skills, curiosity, and circuits that make you proud.',
  'Wishing you joy, focus, and a year of builds that surprise even you.',
  'May every project you start this year evolve into something you’re excited to show.',
];

const CONFETTI_COLORS = [
  colors.primary,
  colors.primaryMuted,
  colors.primarySoft,
  colors.surface,
  colors.accentOrange,
  colors.primaryLight,
];

type BirthdayWishBannerProps = {
  visible: boolean;
  firstName: string;
  age: number | null;
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

function ConfettiPiece({ spec, burstKey }: { spec: ConfettiSpec; burstKey: number }) {
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
  }, [burstKey, progress, spec.delay, spec.duration, spec.rotate, spin]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateY: progress.value * 280 },
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
          left: `${spec.leftPct}%` as `${number}%`,
          width: spec.width,
          height: spec.height,
          backgroundColor: spec.color,
        },
        style,
      ]}
    />
  );
}

function Balloon({
  leftPct,
  color,
  delay,
  size,
}: {
  leftPct: number;
  color: string;
  delay: number;
  size: number;
}) {
  const translateY = useSharedValue(70);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-340, { duration: 7400, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.85, { duration: 700 }),
          withTiming(0.85, { duration: 5200 }),
          withTiming(0, { duration: 1500 }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.balloonWrap,
        { left: `${leftPct}%` as `${number}%` },
        style,
      ]}>
      <View
        style={[
          styles.balloon,
          {
            width: size,
            height: size * 1.28,
            backgroundColor: color,
            borderRadius: size,
          },
        ]}
      />
      <View style={styles.balloonString} />
    </Animated.View>
  );
}

function BirthdayCake() {
  return (
    <Svg width={64} height={64} viewBox="0 0 72 72">
      <Rect x="16" y="34" width="40" height="22" rx="6" fill={colors.primaryLight} />
      <Rect x="20" y="24" width="32" height="16" rx="6" fill={colors.primarySoft} />
      <Rect x="33" y="12" width="6" height="14" rx="3" fill={colors.accentOrange} />
      <Circle cx="36" cy="11" r="4" fill="#fff3c4" />
      <Circle cx="26" cy="45" r="3" fill={colors.primary} />
      <Circle cx="36" cy="45" r="3" fill={colors.primary} />
      <Circle cx="46" cy="45" r="3" fill={colors.primary} />
    </Svg>
  );
}

function makeConfetti(): ConfettiSpec[] {
  return Array.from({ length: 22 }, (_, index) => ({
    leftPct: 8 + ((index * 17) % 84),
    delay: (index % 7) * 40,
    duration: 1400 + (index % 5) * 180,
    drift: (index % 2 === 0 ? 1 : -1) * (12 + (index % 6) * 8),
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    width: 5 + (index % 4),
    height: 8 + (index % 5),
    rotate: 120 + index * 18,
  }));
}

function BirthdayWishBanner({
  visible,
  firstName,
  age,
  onClose,
}: BirthdayWishBannerProps) {
  const [wishIndex, setWishIndex] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const confetti = useMemo(() => makeConfetti(), [burstKey]);
  const logoScale = useSharedValue(0.4);
  const logoFloat = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setWishIndex(0);
    setBurstKey(key => key + 1);
    logoScale.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
    logoFloat.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [logoFloat, logoScale, visible]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: logoFloat.value }, { scale: logoScale.value }],
  }));

  const replay = () => {
    setWishIndex(index => index + 1);
    setBurstKey(key => key + 1);
  };

  const ageLabel =
    age && age > 0 ? `${age} trips around the sun` : 'A year of brighter builds';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={styles.card}
          accessibilityViewIsModal
          accessibilityRole="alert">
          <View style={styles.hex} />
          <Balloon leftPct={8} color={colors.primarySoft} delay={0} size={22} />
          <Balloon leftPct={22} color={colors.accentOrange} delay={900} size={18} />
          <Balloon leftPct={68} color={colors.primaryMuted} delay={400} size={20} />
          <Balloon leftPct={82} color={colors.surface} delay={1400} size={16} />

          {confetti.map((spec, index) => (
            <ConfettiPiece key={`${burstKey}-${index}`} spec={spec} burstKey={burstKey} />
          ))}

          <View style={styles.content}>
            <Animated.View style={[styles.logoWrap, logoStyle]}>
              <Image
                source={require('../../assets/evolve-app-icon.png')}
                style={styles.logo}
                accessibilityIgnoresInvertColors
              />
            </Animated.View>
            <Text style={styles.kicker}>Evolve Robotics</Text>
            <Text
              style={styles.title}
              accessibilityRole="header"
              accessibilityLabel={`Happy Birthday, ${firstName}`}>
              Happy Birthday, {firstName}!
            </Text>
            <Text style={styles.message}>{WISHES[wishIndex % WISHES.length]}</Text>
            <View style={styles.chips}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>{ageLabel}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Keep evolving</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>More robots ahead</Text>
              </View>
            </View>
            <Text style={styles.from}>With love, the Evolve Robotics team</Text>
          </View>

          <View style={styles.cake} pointerEvents="none">
            <BirthdayCake />
          </View>
          <Svg
            style={styles.wave}
            width="100%"
            height={72}
            viewBox="0 0 720 78"
            preserveAspectRatio="none">
            <Path
              d="M0 38c60 22 120-18 180-8s120 34 180 18 120-36 180-18 90 28 180 8v40H0z"
              fill={colors.primarySoft}
            />
            <Path
              d="M0 50c70 16 110-12 180-4s130 24 180 8 110-24 180-8 110 20 180 8v24H0z"
              fill={colors.primaryDark}
            />
          </Svg>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Replay birthday wish"
              onPress={replay}
              style={({ pressed }) => [styles.replay, pressed && styles.pressed]}>
              <Text style={styles.replayText}>Replay</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close birthday wish"
              onPress={onClose}
              style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
              <Text style={styles.closeText}>Thank you</Text>
            </Pressable>
          </View>
        </View>
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
    backgroundColor: colors.primaryDark,
    minHeight: 420,
  },
  hex: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
    opacity: 0.55,
  },
  content: {
    zIndex: 2,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 32,
    paddingBottom: 108,
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    padding: 6,
    marginBottom: 10,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.primaryMuted,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    ...typography.body,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    maxWidth: 420,
    marginBottom: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    borderRadius: spacing.chipRadius,
    borderWidth: 1,
    borderColor: 'rgba(238, 205, 244, 0.45)',
    backgroundColor: 'rgba(250, 242, 255, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  from: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryMuted,
    textAlign: 'center',
  },
  cake: {
    position: 'absolute',
    right: 12,
    bottom: 78,
    zIndex: 3,
  },
  wave: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  actions: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    zIndex: 4,
    flexDirection: 'row',
    gap: 10,
  },
  replay: {
    flex: 1,
    height: 44,
    borderRadius: spacing.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(250, 242, 255, 0.18)',
  },
  replayText: {
    ...typography.button,
    color: colors.surface,
  },
  close: {
    flex: 1.2,
    height: 44,
    borderRadius: spacing.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  closeText: {
    ...typography.button,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  confetti: {
    position: 'absolute',
    top: 56,
    borderRadius: 2,
    zIndex: 5,
  },
  balloonWrap: {
    position: 'absolute',
    bottom: 40,
    zIndex: 1,
    alignItems: 'center',
  },
  balloon: {
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  balloonString: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
});

export default BirthdayWishBanner;

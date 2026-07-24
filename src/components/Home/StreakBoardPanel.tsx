import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Flame, Layers, Sparkles, Zap } from 'lucide-react-native';
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import LevelBadgeIllustration from './icons/LevelBadgeIllustration';
import { cardShadow, colors } from '../../constants/theme';
import { useUserStreakStats } from '../../presentation/hooks/useUserStreakStats';
import type { LoginScreenNavigationProp } from '../../types/navigation';
import { getLearnerMotivation } from '../../utils/gamification/learnerRank';
import { XP_LEVEL_SIZE } from '../../utils/gamification/computeUserStreakStats';

const MIN_PROGRESS_PERCENT = 4;
/** Deepen primaryDark for the card gradient base. */
const CARD_BG_TOP = colors.primaryDark;
const CARD_BG_BOTTOM = '#4a1240';

type StatChipProps = {
  icon: React.ReactNode;
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
};

function StatChip({ icon, label, accessibilityLabel, onPress }: StatChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.statChip,
        pressed && styles.statChipPressed,
      ]}>
      {icon}
      <Text style={styles.statChipText}>{label}</Text>
    </Pressable>
  );
}

type CardBackdropProps = {
  width: number;
  height: number;
};

function CardBackdrop({ width, height }: CardBackdropProps) {
  if (width <= 0 || height <= 0) {
    return <View style={[StyleSheet.absoluteFill, styles.fallbackBg]} />;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="streakCardBg" x1="0%" y1="0%" x2="55%" y2="100%">
            <Stop offset="0%" stopColor={CARD_BG_TOP} />
            <Stop offset="100%" stopColor={CARD_BG_BOTTOM} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#streakCardBg)" />
        <Path
          d={`M0 ${height * 0.72} C${width * 0.12} ${height * 0.58} ${width * 0.22} ${height * 0.62} ${width * 0.34} ${height * 0.52} C${width * 0.46} ${height * 0.42} ${width * 0.55} ${height * 0.5} ${width * 0.68} ${height * 0.4} C${width * 0.82} ${height * 0.3} ${width * 0.9} ${height * 0.36} ${width} ${height * 0.28} L${width} ${height} L0 ${height} Z`}
          fill="rgba(164, 42, 139, 0.35)"
        />
        <Path
          d={`M0 ${height * 0.8} C${width * 0.14} ${height * 0.7} ${width * 0.28} ${height * 0.74} ${width * 0.42} ${height * 0.64} C${width * 0.56} ${height * 0.54} ${width * 0.68} ${height * 0.6} ${width * 0.82} ${height * 0.52} C${width * 0.92} ${height * 0.46} ${width * 0.96} ${height * 0.5} ${width} ${height * 0.46} L${width} ${height} L0 ${height} Z`}
          fill="rgba(74, 18, 64, 0.55)"
        />
      </Svg>

      <View style={styles.glowTop} />
      <View style={styles.glowRight} />
      <Text style={[styles.sparkleGlyph, styles.sparkle1]}>✦</Text>
      <Text style={[styles.sparkleGlyph, styles.sparkle2]}>✦</Text>
      <Text style={[styles.sparkleGlyph, styles.sparkle3]}>✧</Text>
      <Text style={[styles.sparkleGlyph, styles.sparkle4]}>✦</Text>
      <View style={[styles.sparkleDot, styles.sparkleDot1]} />
      <View style={[styles.sparkleDot, styles.sparkleDot2]} />
    </View>
  );
}

function StreakBoardPanel() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { stats, loading } = useUserStreakStats();
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });

  const onCardLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCardSize(prev =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, []);

  const xpRemaining = XP_LEVEL_SIZE - stats.currentXp;
  const motivation = getLearnerMotivation(
    stats.level,
    stats.currentXp,
    XP_LEVEL_SIZE,
  );

  const progressPercent = useMemo(() => {
    if (stats.currentXp <= 0) {
      return 0;
    }
    const ratio = stats.currentXp / XP_LEVEL_SIZE;
    return Math.min(100, Math.max(MIN_PROGRESS_PERCENT, ratio * 100));
  }, [stats.currentXp]);

  const levelProgressText =
    stats.currentXp >= XP_LEVEL_SIZE
      ? 'Level complete — ready for the next challenge.'
      : `${xpRemaining} XP left to complete this level`;

  const dayStreakLabel =
    stats.streakDays === 1 ? '1 Day' : `${stats.streakDays} Days`;

  const handleStreakPress = useCallback(() => {
    navigation.navigate('ToDo', { tab: 'learn' });
  }, [navigation]);

  const handleXpPress = useCallback(() => {
    navigation.navigate('QuizCompetitions');
  }, [navigation]);

  const handleLevelPress = useCallback(() => {
    navigation.navigate('Courses');
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.card} onLayout={onCardLayout}>
        <CardBackdrop width={cardSize.width} height={cardSize.height} />
        <ActivityIndicator color={colors.heroHighlight} style={styles.loader} />
      </View>
    );
  }

  return (
    <View
      style={styles.card}
      onLayout={onCardLayout}
      accessibilityRole="summary"
      accessibilityLabel={`Level ${stats.level}. ${stats.currentXp} of ${XP_LEVEL_SIZE} experience points. ${dayStreakLabel} streak.`}>
      <CardBackdrop width={cardSize.width} height={cardSize.height} />

      <View style={styles.contentRow}>
        <View style={styles.mainColumn}>
          <View style={styles.levelPill}>
            <Zap size={12} color="#fff" fill="#fff" strokeWidth={2} />
            <Text style={styles.levelPillText}>Level {stats.level}</Text>
          </View>

          <Text style={styles.motivation} numberOfLines={2}>
            {motivation}
          </Text>

          <View
            style={styles.progressTrack}
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: XP_LEVEL_SIZE,
              now: stats.currentXp,
            }}>
            <View
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>

          <Text style={styles.xpLabel}>
            {stats.currentXp} / {XP_LEVEL_SIZE} XP
          </Text>

          <Text style={styles.levelProgressText} numberOfLines={2}>
            {levelProgressText}
          </Text>

          <View style={styles.statsRow}>
            <StatChip
              icon={
                <Flame
                  size={12}
                  color={colors.accentOrange}
                  fill={
                    stats.streakDays > 0 ? colors.accentOrange : 'transparent'
                  }
                  strokeWidth={2.25}
                />
              }
              label={dayStreakLabel}
              accessibilityLabel={`Day streak ${dayStreakLabel}. Open lessons to keep your streak.`}
              onPress={handleStreakPress}
            />
            <StatChip
              icon={
                <Sparkles
                  size={12}
                  color={colors.heroHighlight}
                  strokeWidth={2.25}
                />
              }
              label={String(stats.totalXp)}
              accessibilityLabel={`Total ${stats.totalXp} XP. Open quiz competitions to earn more.`}
              onPress={handleXpPress}
            />
            <StatChip
              icon={
                <Layers
                  size={12}
                  color={colors.heroHighlight}
                  strokeWidth={2.25}
                />
              }
              label={`Lv ${stats.level}`}
              accessibilityLabel={`Level ${stats.level}. Open courses to level up.`}
              onPress={handleLevelPress}
            />
          </View>
        </View>

        <View style={styles.illustrationWrap}>
          <LevelBadgeIllustration size={112} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(238, 205, 244, 0.28)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
    overflow: 'hidden',
    minHeight: 188,
    backgroundColor: CARD_BG_BOTTOM,
    ...cardShadow,
  },
  fallbackBg: {
    backgroundColor: CARD_BG_BOTTOM,
  },
  glowTop: {
    position: 'absolute',
    top: -36,
    left: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(164, 42, 139, 0.35)',
  },
  glowRight: {
    position: 'absolute',
    top: 8,
    right: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(238, 205, 244, 0.14)',
  },
  sparkleGlyph: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '700',
  },
  sparkle1: { top: 16, left: '42%', fontSize: 11 },
  sparkle2: { top: 48, right: 26, fontSize: 9, opacity: 0.8 },
  sparkle3: { bottom: 52, left: 16, fontSize: 8, opacity: 0.7 },
  sparkle4: { top: 26, right: '36%', fontSize: 8, opacity: 0.55 },
  sparkleDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  sparkleDot1: { top: 40, left: '58%' },
  sparkleDot2: { bottom: 40, left: '36%' },
  loader: {
    marginVertical: 36,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 4,
  },
  mainColumn: {
    flex: 1,
    minWidth: 0,
    gap: 8,
    zIndex: 1,
  },
  illustrationWrap: {
    width: 108,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -4,
    marginTop: 4,
  },
  levelPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  levelPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
  motivation: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 22,
    paddingRight: 4,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    overflow: 'hidden',
    marginTop: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.heroHighlight,
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.92)',
    lineHeight: 15,
  },
  levelProgressText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 15,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  statChipPressed: {
    opacity: 0.82,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  statChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
});

export default React.memo(StreakBoardPanel);

import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Flame, Layers, Sparkles, Zap } from 'lucide-react-native';

import { cardShadow, colors, spacing } from '../../constants/theme';
import { useUserStreakStats } from '../../presentation/hooks/useUserStreakStats';
import { getLearnerMotivation } from '../../utils/gamification/learnerRank';
import { XP_LEVEL_SIZE } from '../../utils/gamification/computeUserStreakStats';

const MIN_PROGRESS_PERCENT = 4;

type StatChipProps = {
  icon: React.ReactNode;
  label: string;
};

function StatChip({ icon, label }: StatChipProps) {
  return (
    <View style={styles.statChip}>
      {icon}
      <Text style={styles.statChipText}>{label}</Text>
    </View>
  );
}

function StreakBoardPanel() {
  const { stats, loading } = useUserStreakStats();

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

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={colors.heroHighlight} style={styles.loader} />
      </View>
    );
  }

  return (
    <View
      style={styles.card}
      accessibilityRole="summary"
      accessibilityLabel={`Level ${stats.level}. ${stats.currentXp} of ${XP_LEVEL_SIZE} experience points. ${dayStreakLabel} streak.`}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

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
          />
          <StatChip
            icon={
              <Sparkles size={12} color={colors.heroHighlight} strokeWidth={2.25} />
            }
            label={String(stats.totalXp)}
          />
          <StatChip
            icon={
              <Layers size={12} color={colors.heroHighlight} strokeWidth={2.25} />
            }
            label={`Lv ${stats.level}`}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryDark,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: 'rgba(238, 205, 244, 0.28)',
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 20,
    overflow: 'hidden',
    ...cardShadow,
  },
  glowTop: {
    position: 'absolute',
    top: -30,
    left: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(164, 42, 139, 0.35)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -36,
    right: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(238, 205, 244, 0.12)',
  },
  loader: {
    marginVertical: 22,
  },
  mainColumn: {
    gap: 8,
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
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 19,
    paddingRight: 4,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.heroHighlight,
  },
  xpLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 14,
  },
  levelProgressText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.72)',
    lineHeight: 15,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
});

export default React.memo(StreakBoardPanel);

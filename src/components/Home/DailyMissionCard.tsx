import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { Check, Zap } from 'lucide-react-native';

import { cardShadow, colors } from '../../constants/theme';

export type DailyMissionCardProps = {
  icon: React.ReactNode;
  title: string;
  xpReward: number;
  isDone: boolean;
  accentColor: string;
  accentBackground: string;
  accentBorder: string;
  onStartPress?: () => void;
  style?: ViewStyle;
};

function DailyMissionCard({
  icon,
  title,
  xpReward,
  isDone,
  accentColor,
  accentBackground,
  accentBorder,
  onStartPress,
  style,
}: DailyMissionCardProps) {
  const progressPercent = isDone ? 100 : 0;

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: accentBorder,
          backgroundColor: colors.surface,
        },
        style,
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`${title}. Earn ${xpReward} XP. ${isDone ? 'Completed' : 'Not started'}.`}>
      <View
        style={[styles.glow, { backgroundColor: accentBackground }]}
        pointerEvents="none"
      />

      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: accentBackground }]}>
          {icon}
        </View>
        {isDone ? (
          <View style={[styles.doneBadge, { backgroundColor: accentBackground }]}>
            <Check size={11} color={accentColor} strokeWidth={3} />
            <Text style={[styles.doneText, { color: accentColor }]}>Done</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      <View style={styles.rewardRow}>
        <Zap size={13} color={accentColor} fill={accentColor} strokeWidth={2} />
        <Text style={[styles.rewardText, { color: accentColor }]}>
          {xpReward} XP
        </Text>
      </View>

      <View
        style={[styles.progressTrack, { backgroundColor: accentBackground }]}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: progressPercent,
        }}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.max(progressPercent, isDone ? 100 : 0)}%`,
              backgroundColor: accentColor,
            },
          ]}
        />
      </View>

      {!isDone ? (
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: accentColor }]}
          activeOpacity={0.88}
          onPress={onStartPress}
          disabled={!onStartPress}
          accessibilityRole="button"
          accessibilityLabel={`Start ${title}`}>
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.completedSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    overflow: 'hidden',
    ...cardShadow,
  },
  glow: {
    position: 'absolute',
    top: -24,
    right: -18,
    width: 72,
    height: 72,
    borderRadius: 36,
    opacity: 0.55,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  doneText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.15,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 19,
    minHeight: 38,
    marginBottom: 8,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  startButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 20,
  },
  startButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
  completedSpacer: {
    height: 34,
  },
});

export default React.memo(DailyMissionCard);

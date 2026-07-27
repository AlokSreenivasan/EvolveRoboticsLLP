import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { Check, Zap } from 'lucide-react-native';

import { cardShadow, colors, glassBorder } from '../../constants/theme';

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
  const actionLabel = isDone ? 'Done' : 'Start';

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      activeOpacity={0.92}
      onPress={onStartPress}
      disabled={!onStartPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. Earn ${xpReward} XP. ${isDone ? 'Completed' : 'Not started'}.`}>
      <View
        style={[styles.glow, { backgroundColor: accentBackground }]}
        pointerEvents="none"
      />

      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: accentBackground,
              borderColor: accentBorder,
            },
          ]}>
          {icon}
        </View>
        {isDone ? (
          <View style={[styles.doneChip, { backgroundColor: accentBackground }]}>
            <Check size={12} color={accentColor} strokeWidth={3} />
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
              width: `${progressPercent}%`,
              backgroundColor: accentColor,
            },
          ]}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.startButton,
          isDone
            ? {
                backgroundColor: accentBackground,
                borderWidth: 1,
                borderColor: accentBorder,
              }
            : { backgroundColor: accentColor },
        ]}
        activeOpacity={0.88}
        onPress={onStartPress}
        disabled={!onStartPress}
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel} ${title}`}>
        <Text
          style={[
            styles.startButtonText,
            isDone && { color: accentColor },
          ]}>
          {actionLabel}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    borderRadius: 22,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    overflow: 'hidden',
    ...glassBorder,
    ...cardShadow,
  },
  glow: {
    position: 'absolute',
    top: -28,
    right: -20,
    width: 88,
    height: 88,
    borderRadius: 44,
    opacity: 0.9,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  doneChip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 19,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  startButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 999,
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
});

export default React.memo(DailyMissionCard);

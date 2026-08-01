import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { Check, Zap } from 'lucide-react-native';

import { colors } from '../../constants/theme';
import { softenColor } from '../../utils/ui/softenColor';
import CardShadowShell from '../ui/CardShadowShell';
import TactileButton from '../ui/TactileButton';

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
  const faceColor = softenColor(accentColor, isDone ? 0.06 : 0.13);
  const faceBorderColor = softenColor(accentColor, isDone ? 0.26 : 0.42);
  const edgeColor = softenColor(accentColor, isDone ? 0.22 : 0.36);

  return (
    <CardShadowShell
      style={[styles.shell, style]}
      innerStyle={styles.cardInner}
      borderRadius={22}>
      <TouchableOpacity
        style={styles.pressable}
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

      <TactileButton
        style={styles.startButton}
        faceColor={faceColor}
        edgeColor={edgeColor}
        borderColor={faceBorderColor}
        onPress={onStartPress}
        disabled={!onStartPress}
        accessibilityLabel={`${actionLabel} ${title}`}>
        <Text style={[styles.startButtonText, { color: accentColor }]}>
          {actionLabel}
        </Text>
      </TactileButton>
      </TouchableOpacity>
    </CardShadowShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: 168,
  },
  cardInner: {},
  pressable: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
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
    paddingVertical: 10,
    borderRadius: 999,
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default React.memo(DailyMissionCard);

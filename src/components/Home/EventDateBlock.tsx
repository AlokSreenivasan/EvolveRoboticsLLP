import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '../../constants/theme';
import CardShadowShell from '../ui/CardShadowShell';

export type EventDateBlockSize = 'default' | 'compact';

type EventDateBlockProps = {
  month: string;
  day: string;
  size?: EventDateBlockSize;
  style?: StyleProp<ViewStyle>;
};

function EventDateBlock({
  month,
  day,
  size = 'default',
  style,
}: EventDateBlockProps) {
  const isCompact = size === 'compact';
  const displayMonth = month.trim().toUpperCase().slice(0, 3);
  const borderRadius = isCompact ? 12 : 14;

  return (
    <CardShadowShell
      elevation="light"
      borderRadius={borderRadius}
      borderless
      style={style}
      innerStyle={isCompact ? styles.innerCompact : styles.inner}>
      <View style={isCompact ? styles.monthBandCompact : styles.monthBand}>
        <Text style={isCompact ? styles.monthCompact : styles.month}>
          {displayMonth}
        </Text>
      </View>
      <Text style={isCompact ? styles.dayCompact : styles.day}>
        {day.trim()}
      </Text>
    </CardShadowShell>
  );
}

const styles = StyleSheet.create({
  inner: {
    width: 56,
    height: 64,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  innerCompact: {
    width: 48,
    height: 52,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  monthBand: {
    width: '100%',
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: 4,
  },
  month: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.8,
  },
  day: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
    marginTop: 4,
  },
  monthBandCompact: {
    width: '100%',
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: 3,
  },
  monthCompact: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.6,
  },
  dayCompact: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 22,
    marginTop: 3,
  },
});

export default React.memo(EventDateBlock);

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '../../constants/theme';

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

  return (
    <View style={[isCompact ? styles.blockCompact : styles.block, style]}>
      <Text style={isCompact ? styles.monthCompact : styles.month}>
        {displayMonth}
      </Text>
      <Text style={isCompact ? styles.dayCompact : styles.day}>
        {day.trim()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    width: 56,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  month: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  day: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
  },
  blockCompact: {
    width: 48,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  monthCompact: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  dayCompact: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 22,
  },
});

export default React.memo(EventDateBlock);

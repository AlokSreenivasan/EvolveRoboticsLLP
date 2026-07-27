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
      <View style={isCompact ? styles.monthBandCompact : styles.monthBand}>
        <Text style={isCompact ? styles.monthCompact : styles.month}>
          {displayMonth}
        </Text>
      </View>
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
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
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
  blockCompact: {
    width: 48,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
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

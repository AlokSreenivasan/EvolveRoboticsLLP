import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { cardShadow, colors, spacing } from '../../constants/theme';

type SettingsCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

function SettingsCard({ children, style }: SettingsCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    overflow: 'hidden',
    ...cardShadow,
  },
});

export default SettingsCard;

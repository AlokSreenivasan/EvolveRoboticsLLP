import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';

import {
  cardShadowLight,
  colors,
  glassBorder,
  spacing,
} from '../../constants/theme';

const CHIP_MIN_HEIGHT = 44;

type ChatKeywordChipProps = {
  label: string;
  onPress: () => void;
};

function ChatKeywordChip({ label, onPress }: ChatKeywordChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Send keyword ${label}`}>
      <Sparkles size={12} color={colors.primary} strokeWidth={2.5} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 8,
    minHeight: CHIP_MIN_HEIGHT,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: spacing.chipRadius,
    backgroundColor: colors.surface,
    ...glassBorder,
    ...cardShadowLight,
  },
  chipPressed: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primarySoft,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.1,
  },
});

export default ChatKeywordChip;

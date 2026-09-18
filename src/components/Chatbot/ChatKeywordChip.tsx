import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';

import {
  buttonVariants,
  colors,
  glassBorder,
  spacing,
} from '../../constants/theme';

const CHIP_MIN_HEIGHT = 36;

type ChatKeywordChipProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  muted?: boolean;
  accessibilityLabel?: string;
};

function ChatKeywordChip({
  label,
  onPress,
  disabled = false,
  muted = false,
  accessibilityLabel,
}: ChatKeywordChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        muted && styles.chipMuted,
        pressed && !disabled && styles.chipPressed,
        disabled && styles.chipDisabled,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel ?? `Send keyword ${label}`}>
      <Sparkles
        size={12}
        color={muted ? colors.textSecondary : colors.primary}
        strokeWidth={2.5}
      />
      <Text style={[styles.label, muted && styles.labelMuted]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    minHeight: CHIP_MIN_HEIGHT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: spacing.chipRadius,
    backgroundColor: colors.primaryLight,
    ...glassBorder,
    borderColor: colors.primaryMuted,
  },
  chipMuted: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipPressed: {
    backgroundColor: buttonVariants.primary.edge,
    borderColor: buttonVariants.primary.border,
  },
  chipDisabled: {
    opacity: 0.55,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.1,
  },
  labelMuted: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

export default ChatKeywordChip;

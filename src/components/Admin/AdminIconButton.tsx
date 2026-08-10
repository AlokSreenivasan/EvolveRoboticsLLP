import React from 'react';
import { TouchableOpacity } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { colors } from '../../constants/theme';
import { adminStyles } from './adminStyles';

type AdminIconButtonProps = {
  icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
  accessibilityLabel?: string;
};

function AdminIconButton({
  icon: Icon,
  onPress,
  disabled,
  danger,
  accessibilityLabel,
}: AdminIconButtonProps) {
  return (
    <TouchableOpacity
      style={[adminStyles.iconButton, disabled && adminStyles.iconButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button">
      <Icon
        size={18}
        color={danger ? colors.danger : colors.primary}
        strokeWidth={2}
      />
    </TouchableOpacity>
  );
}

export default AdminIconButton;

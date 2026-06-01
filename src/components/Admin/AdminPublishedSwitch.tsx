import React from 'react';
import { Switch, Text, View } from 'react-native';

import { colors } from '../../constants/theme';
import { adminStyles } from './adminStyles';

type AdminPublishedSwitchProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function AdminPublishedSwitch({
  label,
  value,
  onValueChange,
}: AdminPublishedSwitchProps) {
  return (
    <View style={adminStyles.switchRow}>
      <Text style={adminStyles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.primarySoft, false: colors.border }}
        thumbColor={value ? colors.primary : colors.textMuted}
      />
    </View>
  );
}

export default AdminPublishedSwitch;

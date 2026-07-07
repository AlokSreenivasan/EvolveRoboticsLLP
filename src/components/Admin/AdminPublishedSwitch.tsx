import React from 'react';
import { Text, View } from 'react-native';

import { adminStyles } from './adminStyles';
import AppSwitch from '../AppSwitch';

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
      <AppSwitch value={value} onValueChange={onValueChange} />
    </View>
  );
}

export default AdminPublishedSwitch;

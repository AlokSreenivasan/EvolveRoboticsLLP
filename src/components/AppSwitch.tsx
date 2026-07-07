import React, { useCallback } from 'react';
import { StyleSheet, Switch, type SwitchProps, View } from 'react-native';

import { colors } from '../constants/theme';

type AppSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: SwitchProps['style'];
  testID?: SwitchProps['testID'];
};

function AppSwitch({
  value,
  onValueChange,
  disabled = false,
  style,
  testID,
}: AppSwitchProps) {
  const handleValueChange = useCallback(
    (nextValue: boolean) => {
      if (disabled) {
        return;
      }
      onValueChange(nextValue);
    },
    [disabled, onValueChange],
  );

  return (
    <View style={[styles.wrap, disabled && styles.disabled]}>
      <Switch
        testID={testID}
        value={value}
        onValueChange={handleValueChange}
        accessibilityState={{ disabled }}
        disabled={disabled}
        trackColor={{
          false: colors.primaryMuted,
          true: colors.primary,
        }}
        thumbColor={value ? colors.surface : colors.surface}
        ios_backgroundColor={colors.primaryMuted}
        style={style}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    marginRight: 12,
  },
  disabled: {
    opacity: 0.55,
  },
});

export default AppSwitch;

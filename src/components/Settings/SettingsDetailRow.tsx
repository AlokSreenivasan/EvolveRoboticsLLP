import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../../constants/theme';

type SettingsDetailRowProps = {
  label: string;
  value: string;
  onPress?: () => void;
  isLast?: boolean;
};

function SettingsDetailRow({
  label,
  value,
  onPress,
  isLast = false,
}: SettingsDetailRowProps) {
  const content = (
    <>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, onPress ? styles.valueLink : null]}>
        {value}
      </Text>
    </>
  );

  if (!onPress) {
    return (
      <View style={[styles.row, !isLast && styles.rowBorder]}>{content}</View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  valueLink: {
    color: colors.link,
  },
});

export default SettingsDetailRow;

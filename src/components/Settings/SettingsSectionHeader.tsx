import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, sectionTitleStyle } from '../../constants/theme';

type SettingsSectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

function SettingsSectionHeader({
  title,
  actionLabel,
  onActionPress,
}: SettingsSectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onActionPress ? (
        <TouchableOpacity onPress={onActionPress} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    ...sectionTitleStyle,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.link,
  },
});

export default SettingsSectionHeader;

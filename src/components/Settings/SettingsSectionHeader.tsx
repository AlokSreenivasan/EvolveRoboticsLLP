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
        <TouchableOpacity
          onPress={onActionPress}
          hitSlop={8}
          style={styles.actionHit}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}>
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
    paddingHorizontal: 2,
  },
  title: {
    ...sectionTitleStyle,
    fontWeight: '800',
  },
  actionHit: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  action: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.link,
  },
});

export default SettingsSectionHeader;

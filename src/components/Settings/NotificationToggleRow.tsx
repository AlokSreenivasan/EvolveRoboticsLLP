import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { colors, spacing } from '../../constants/theme';
import AppSwitch from '../AppSwitch';

type NotificationToggleRowProps = {
  icon: LucideIcon;
  iconColor: string;
  iconBackgroundColor: string;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  isLast?: boolean;
};

function NotificationToggleRow({
  icon: Icon,
  iconColor,
  iconBackgroundColor,
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false,
  isLast = false,
}: NotificationToggleRowProps) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View
        style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
        <Icon size={20} color={iconColor} strokeWidth={2.15} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <AppSwitch value={value} onValueChange={onValueChange} disabled={disabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 72,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(164, 42, 139, 0.1)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: spacing.iconTileRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default NotificationToggleRow;

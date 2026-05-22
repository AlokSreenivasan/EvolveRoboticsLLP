import React from 'react';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

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

const PRIMARY_ACTIVE = '#a42a8b';

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
        <Icon size={22} color={iconColor} strokeWidth={2} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: '#D1D5DB',
          true: Platform.OS === 'ios' ? '#E8B4DC' : PRIMARY_ACTIVE,
        }}
        thumbColor={value ? PRIMARY_ACTIVE : '#f4f4f5'}
        ios_backgroundColor="#D1D5DB"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});

export default NotificationToggleRow;

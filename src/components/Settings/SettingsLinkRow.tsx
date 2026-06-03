import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { colors } from '../../constants/theme';

type SettingsLinkRowProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  icon?: LucideIcon;
  iconColor?: string;
  iconBackgroundColor?: string;
  variant?: 'default' | 'link';
  isLast?: boolean;
  disabled?: boolean;
};

function SettingsLinkRow({
  title,
  subtitle,
  onPress,
  icon: Icon,
  iconColor = colors.primary,
  iconBackgroundColor = colors.primaryLight,
  variant = 'default',
  isLast = false,
  disabled = false,
}: SettingsLinkRowProps) {
  const titleStyle =
    variant === 'link' ? styles.titleLink : styles.titleDefault;

  const content = (
    <>
      {Icon ? (
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconBackgroundColor },
          ]}>
          <Icon size={22} color={iconColor} strokeWidth={2} />
        </View>
      ) : null}

      <View style={styles.textContainer}>
        <Text style={titleStyle}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {onPress ? (
        <ChevronRight
          size={20}
          color={colors.textMuted}
          strokeWidth={2}
        />
      ) : null}
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
      disabled={disabled}
      activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
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
    borderBottomColor: colors.border,
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
    marginRight: 8,
  },
  titleDefault: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  titleLink: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.link,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
});

export default SettingsLinkRow;

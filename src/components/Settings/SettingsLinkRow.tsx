import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { colors, spacing } from '../../constants/theme';

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
          <Icon size={20} color={iconColor} strokeWidth={2.15} />
        </View>
      ) : null}

      <View style={styles.textContainer}>
        <Text style={titleStyle}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {onPress ? (
        <View style={styles.chevronWrap}>
          <ChevronRight
            size={18}
            color={colors.primary}
            strokeWidth={2.25}
          />
        </View>
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
      activeOpacity={0.72}>
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
    minHeight: 64,
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
    marginRight: 8,
  },
  titleDefault: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  titleLink: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.link,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SettingsLinkRow;

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { colors, spacing } from '../../constants/theme';
import SurfaceCard from '../ui/SurfaceCard';

type SettingsInfoCardProps = {
  icon: LucideIcon;
  iconColor?: string;
  iconBackgroundColor?: string;
  title: string;
  description: string;
};

function SettingsInfoCard({
  icon: Icon,
  iconColor = colors.primary,
  iconBackgroundColor = colors.primaryLight,
  title,
  description,
}: SettingsInfoCardProps) {
  return (
    <SurfaceCard elevation="default" style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: iconBackgroundColor }]}>
        <Icon size={20} color={iconColor} strokeWidth={2.15} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: spacing.sectionGap,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: spacing.iconTileRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});

export default SettingsInfoCard;

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { FileText } from 'lucide-react-native';

import { cardShadow, colors } from '../../constants/theme';

const CARD_ACCENTS = [
  { badgeColor: colors.primaryLight, accentColor: colors.primary },
  { badgeColor: '#E8F5E9', accentColor: colors.accentGreen },
  { badgeColor: '#F3E5F5', accentColor: '#9C27B0' },
] as const;

export type PdfContentCardProps = {
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  accentIndex?: number;
  Icon?: LucideIcon;
  ctaLabel?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

function PdfContentCard({
  title,
  subtitle,
  badgeLabel,
  accentIndex = 0,
  Icon = FileText,
  ctaLabel = 'Open PDF',
  onPress,
  accessibilityLabel,
}: PdfContentCardProps) {
  const accent = CARD_ACCENTS[accentIndex % CARD_ACCENTS.length];
  const trimmedBadge = badgeLabel?.trim();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}>
      <View style={[styles.iconWrap, { backgroundColor: accent.badgeColor }]}>
        <Icon size={28} color={accent.accentColor} strokeWidth={2} />
      </View>

      <View style={styles.body}>
        {trimmedBadge ? (
          <View style={[styles.badge, { backgroundColor: accent.badgeColor }]}>
            <Text style={[styles.badgeText, { color: accent.accentColor }]}>
              {trimmedBadge}
            </Text>
          </View>
        ) : null}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle?.trim() ? (
          <Text style={styles.subtitle} numberOfLines={3}>
            {subtitle.trim()}
          </Text>
        ) : null}
        <Text style={styles.cta}>{ctaLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    ...cardShadow,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  body: {
    flex: 1,
    paddingTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  cta: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.link,
  },
});

export default PdfContentCard;

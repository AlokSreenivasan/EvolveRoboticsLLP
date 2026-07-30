import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { FileText } from 'lucide-react-native';

import { colors } from '../../constants/theme';
import SurfaceCard from '../ui/SurfaceCard';

const CARD_ACCENTS = [
  { badgeColor: colors.primaryLight, accentColor: colors.primary },
  { badgeColor: colors.successLight, accentColor: colors.accentGreen },
  { badgeColor: colors.noticeBackground, accentColor: colors.primaryDark },
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
    <SurfaceCard elevation="default" style={styles.card}>
      <TouchableOpacity
        style={styles.pressable}
        activeOpacity={0.9}
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}>
        <View style={[styles.iconWrap, { backgroundColor: accent.badgeColor }]}>
          <Icon size={26} color={accent.accentColor} strokeWidth={2.15} />
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
          <View style={styles.ctaPill}>
            <Text style={styles.cta}>{ctaLabel}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: 14,
    borderColor: colors.primaryMuted,
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 22,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  ctaPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  cta: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.link,
  },
});

export default React.memo(PdfContentCard);

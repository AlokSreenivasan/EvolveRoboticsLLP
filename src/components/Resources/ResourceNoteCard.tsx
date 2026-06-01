import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FileText } from 'lucide-react-native';

import { cardShadow, colors } from '../../constants/theme';
import type { ResourceNote } from '../../store/content/types/resources.types';

const CARD_ACCENTS = [
  { badgeColor: colors.primaryLight, accentColor: colors.primary },
  { badgeColor: '#E8F5E9', accentColor: colors.accentGreen },
  { badgeColor: '#F3E5F5', accentColor: '#9C27B0' },
] as const;

type ResourceNoteCardProps = {
  note: Pick<ResourceNote, 'title' | 'subtitle'>;
  accentIndex?: number;
  onPress?: () => void;
};

function ResourceNoteCard({
  note,
  accentIndex = 0,
  onPress,
}: ResourceNoteCardProps) {
  const accent = CARD_ACCENTS[accentIndex % CARD_ACCENTS.length];

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Resource note ${note.title}`}>
      <View style={[styles.iconWrap, { backgroundColor: accent.badgeColor }]}>
        <FileText size={28} color={accent.accentColor} strokeWidth={2} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {note.title}
        </Text>
        {note.subtitle?.trim() ? (
          <Text style={styles.subtitle} numberOfLines={3}>
            {note.subtitle.trim()}
          </Text>
        ) : null}
        <Text style={styles.cta}>Open PDF</Text>
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

export default ResourceNoteCard;

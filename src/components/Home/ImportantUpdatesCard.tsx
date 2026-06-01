import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Megaphone } from 'lucide-react-native';

import { cardShadowLight, colors } from '../../constants/theme';
import type { ImportantUpdateNotice } from '../../store/content/types/importantUpdates.types';

type ImportantUpdatesCardProps = {
  notice: Pick<
    ImportantUpdateNotice,
    'tag' | 'title' | 'subtitle' | 'description'
  >;
  onPress?: () => void;
};

function ImportantUpdatesCard({ notice, onPress }: ImportantUpdatesCardProps) {
  const subtitle = notice.subtitle?.trim();
  const description = notice.description?.trim();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.iconWrap}>
        <Megaphone size={22} color={colors.primary} strokeWidth={2} />
      </View>

      <View style={styles.content}>
        {notice.tag?.trim() ? (
          <Text style={styles.tag}>{notice.tag.trim()}</Text>
        ) : null}
        <Text style={styles.title}>{notice.title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>

      <ChevronRight size={20} color={colors.textMuted} strokeWidth={2} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.noticeBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.noticeBorder,
    ...cardShadowLight,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  tag: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default React.memo(ImportantUpdatesCard);

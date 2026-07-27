import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Megaphone } from 'lucide-react-native';

import { cardShadowLight, colors, glassBorder } from '../../constants/theme';
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
      <View style={styles.accentBar} />
      <View style={styles.iconWrap}>
        <Megaphone size={20} color={colors.primary} strokeWidth={2.15} />
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.noticeBackground,
    borderRadius: 20,
    paddingVertical: 16,
    paddingRight: 16,
    paddingLeft: 14,
    overflow: 'hidden',
    ...glassBorder,
    borderColor: colors.noticeBorder,
    ...cardShadowLight,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
    opacity: 0.85,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...cardShadowLight,
  },
  content: {
    flex: 1,
  },
  tag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
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

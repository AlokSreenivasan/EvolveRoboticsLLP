import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Megaphone } from 'lucide-react-native';

import { IMPORTANT_UPDATE } from '../../constants/homeScreenData';
import { cardShadowLight, colors } from '../../constants/theme';

function ImportantUpdatesCard() {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <View style={styles.iconWrap}>
        <Megaphone size={22} color={colors.primary} strokeWidth={2} />
      </View>

      <View style={styles.content}>
        <Text style={styles.tag}>{IMPORTANT_UPDATE.tag}</Text>
        <Text style={styles.title}>{IMPORTANT_UPDATE.title}</Text>
        <Text style={styles.description}>{IMPORTANT_UPDATE.description}</Text>
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
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default ImportantUpdatesCard;

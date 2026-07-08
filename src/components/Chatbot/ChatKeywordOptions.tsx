import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../constants/theme';
import type { ChatKeyword } from '../../store/content/types/chatKeywords.types';
import ChatKeywordChip from './ChatKeywordChip';

type ChatKeywordOptionsProps = {
  keywords: ChatKeyword[];
  onKeywordPress: (label: string) => void;
};

function ChatKeywordOptions({
  keywords,
  onKeywordPress,
}: ChatKeywordOptionsProps) {
  if (keywords.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Quick options</Text>
      <View style={styles.list}>
        {keywords.map(keyword => (
          <ChatKeywordChip
            key={keyword.id}
            label={keyword.label}
            onPress={() => onKeywordPress(keyword.label)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.primaryMuted,
    backgroundColor: colors.primaryLight,
  },
  hint: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingHorizontal: spacing.screenHorizontal,
  },
  list: {
    gap: 8,
    paddingHorizontal: spacing.screenHorizontal,
  },
});

export default ChatKeywordOptions;

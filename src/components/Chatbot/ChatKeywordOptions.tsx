import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../constants/theme';
import type { ChatKeyword } from '../../store/content/types/chatKeywords.types';
import ChatKeywordChip from './ChatKeywordChip';

type ChatKeywordOptionsProps = {
  keywords: ChatKeyword[];
  onKeywordPress: (keyword: ChatKeyword) => void;
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
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled>
        {keywords.map(keyword => (
          <ChatKeywordChip
            key={keyword.id}
            label={keyword.label}
            onPress={() => onKeywordPress(keyword)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 14,
    paddingBottom: 4,
    backgroundColor: colors.surface,
  },
  hint: {
    ...typography.label,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingHorizontal: spacing.screenHorizontal,
  },
  list: {
    maxHeight: 168,
  },
  listContent: {
    gap: 8,
    paddingHorizontal: spacing.screenHorizontal,
  },
});

export default ChatKeywordOptions;

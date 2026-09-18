import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../constants/theme';
import type { ChatKeyword } from '../../store/content/types/chatKeywords.types';
import ChatKeywordChip from './ChatKeywordChip';

type ChatKeywordOptionsProps = {
  keywords: ChatKeyword[];
  onKeywordPress: (keyword: ChatKeyword) => void;
  disabled?: boolean;
  loading?: boolean;
  canExpand?: boolean;
  expanded?: boolean;
  onToggleExpanded?: () => void;
};

function ChatKeywordOptions({
  keywords,
  onKeywordPress,
  disabled = false,
  loading = false,
  canExpand = false,
  expanded = false,
  onToggleExpanded,
}: ChatKeywordOptionsProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.hint}>Loading topics</Text>
      </View>
    );
  }

  if (keywords.length === 0 && !canExpand) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Try a topic</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled">
        {keywords.map(keyword => (
          <ChatKeywordChip
            key={keyword.id}
            label={keyword.label}
            disabled={disabled}
            onPress={() => onKeywordPress(keyword)}
          />
        ))}
        {canExpand && onToggleExpanded ? (
          <ChatKeywordChip
            label={expanded ? 'Fewer topics' : 'More topics'}
            muted
            disabled={disabled}
            accessibilityLabel={
              expanded ? 'Show fewer topics' : 'Show more topics'
            }
            onPress={onToggleExpanded}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
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
  listContent: {
    gap: 8,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 4,
  },
});

export default ChatKeywordOptions;

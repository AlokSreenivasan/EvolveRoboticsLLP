import React from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Send } from 'lucide-react-native';

import {
  buttonVariants,
  cardShadowElevated,
  cardShadowLight,
  colors,
  glassBorder,
  inputFieldStyle,
  spacing,
} from '../../constants/theme';
import type { ChatKeyword } from '../../store/content/types/chatKeywords.types';
import TactileButton from '../ui/TactileButton';
import ChatKeywordOptions from './ChatKeywordOptions';

type ChatComposerProps = {
  keywords: ChatKeyword[];
  draft: string;
  onDraftChange: (text: string) => void;
  onSend: () => void;
  onKeywordPress: (keyword: ChatKeyword) => void;
  disabled?: boolean;
  loadingKeywords?: boolean;
  canExpandKeywords?: boolean;
  keywordsExpanded?: boolean;
  onToggleKeywordsExpanded?: () => void;
};

function ChatComposer({
  keywords,
  draft,
  onDraftChange,
  onSend,
  onKeywordPress,
  disabled = false,
  loadingKeywords = false,
  canExpandKeywords = false,
  keywordsExpanded = false,
  onToggleKeywordsExpanded,
}: ChatComposerProps) {
  const canSend = draft.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <ChatKeywordOptions
        keywords={keywords}
        onKeywordPress={onKeywordPress}
        disabled={disabled}
        loading={loadingKeywords}
        canExpand={canExpandKeywords}
        expanded={keywordsExpanded}
        onToggleExpanded={onToggleKeywordsExpanded}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask about Evolve…"
          placeholderTextColor={colors.textMuted}
          value={draft}
          onChangeText={onDraftChange}
          multiline
          maxLength={500}
          editable={!disabled}
          returnKeyType="send"
          onSubmitEditing={onSend}
        />
        <TactileButton
          variant="primary"
          onPress={onSend}
          disabled={!canSend}
          borderRadius={22}
          style={styles.sendButton}
          accessibilityLabel="Send message">
          <Send
            size={18}
            color={buttonVariants.primary.text}
            strokeWidth={2.5}
          />
        </TactileButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 2,
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.cardRadiusLg,
    borderTopRightRadius: spacing.cardRadiusLg,
    ...glassBorder,
    borderBottomWidth: 0,
    ...cardShadowElevated,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    ...inputFieldStyle,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: colors.textPrimary,
    ...cardShadowLight,
  },
  sendButton: {
    width: 44,
    height: 44,
    minHeight: 44,
    paddingVertical: 0,
    paddingHorizontal: 0,
    alignSelf: 'flex-end',
  },
});

export default ChatComposer;

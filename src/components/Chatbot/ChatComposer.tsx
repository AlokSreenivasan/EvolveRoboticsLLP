import React from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Send } from 'lucide-react-native';

import {
  cardShadowElevated,
  cardShadowLight,
  colors,
  glassBorder,
  inputFieldStyle,
  spacing,
} from '../../constants/theme';
import type { ChatKeyword } from '../../store/content/types/chatKeywords.types';
import ChatKeywordOptions from './ChatKeywordOptions';

type ChatComposerProps = {
  keywords: ChatKeyword[];
  draft: string;
  onDraftChange: (text: string) => void;
  onSend: () => void;
  onKeywordPress: (label: string) => void;
};

function ChatComposer({
  keywords,
  draft,
  onDraftChange,
  onSend,
  onKeywordPress,
}: ChatComposerProps) {
  const canSend = draft.trim().length > 0;

  return (
    <View style={styles.container}>
      <ChatKeywordOptions
        keywords={keywords}
        onKeywordPress={onKeywordPress}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          value={draft}
          onChangeText={onDraftChange}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={onSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          activeOpacity={0.85}
          onPress={onSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Send message">
          <Send size={18} color={colors.surface} strokeWidth={2.5} />
        </TouchableOpacity>
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
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadowLight,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});

export default ChatComposer;

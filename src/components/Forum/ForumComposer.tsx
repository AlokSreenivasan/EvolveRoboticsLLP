import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
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
import { MAX_MESSAGE_LENGTH } from '../../utils/forum/classForumText';

type ForumComposerProps = {
  draft: string;
  onDraftChange: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
};

function ForumComposer({
  draft,
  onDraftChange,
  onSend,
  disabled = false,
  placeholder = 'Write a message…',
}: ForumComposerProps) {
  const canSend = draft.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={draft}
          onChangeText={onDraftChange}
          multiline
          maxLength={MAX_MESSAGE_LENGTH}
          editable={!disabled}
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
      {disabled ? (
        <Text style={styles.lockedHint}>This forum is locked by a facilitator.</Text>
      ) : null}
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
  lockedHint: {
    marginTop: -8,
    marginBottom: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: spacing.screenHorizontal,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default ForumComposer;

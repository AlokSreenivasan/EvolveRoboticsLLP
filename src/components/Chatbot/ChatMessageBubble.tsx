import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import {
  buttonVariants,
  cardShadowLight,
  colors,
  glassBorder,
  spacing,
  typography,
} from '../../constants/theme';

type ChatMessageBubbleProps = {
  role: 'user' | 'assistant';
  text: string;
};

function ChatMessageBubble({ role, text }: ChatMessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <View
      style={[
        styles.row,
        isUser ? styles.rowUser : styles.rowAssistant,
      ]}>
      {isUser ? null : (
        <Image
          source={require('../../assets/chat-assistant.webp')}
          style={styles.avatar}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      )}
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}>
        <Text
          style={[
            styles.text,
            isUser ? styles.userText : styles.assistantText,
          ]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
    maxWidth: '88%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  rowAssistant: {
    alignSelf: 'flex-start',
  },
  rowUser: {
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    marginBottom: 2,
  },
  bubble: {
    flexShrink: 1,
    borderRadius: spacing.cardRadius,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...cardShadowLight,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    ...glassBorder,
  },
  userBubble: {
    backgroundColor: buttonVariants.primary.face,
    borderWidth: 1.5,
    borderColor: buttonVariants.primary.border,
  },
  text: {
    ...typography.body,
  },
  assistantText: {
    color: colors.textPrimary,
  },
  userText: {
    color: buttonVariants.primary.text,
  },
});

export default ChatMessageBubble;

import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MessageCircle, Send } from 'lucide-react-native';

import BackButton from '../../../components/BackButton';
import { cardShadow, colors, spacing } from '../../../constants/theme';
import type { LoginScreenNavigationProp } from '../../../types/navigation';

type ChatMessage = {
  id: string;
  text: string;
  role: 'user' | 'assistant';
};

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  text: "Hi! I'm your Evolve assistant. How can I help you today?",
  role: 'assistant',
};

function ChatbotScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');

  const handleStartChat = () => {
    setIsChatActive(true);
    setMessages([WELCOME_MESSAGE]);
  };

  const handleBack = () => {
    if (isChatActive) {
      setIsChatActive(false);
      setMessages([]);
      setDraft('');
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, text: trimmed, role: 'user' },
    ]);
    setDraft('');
  }, [draft]);

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isUser = item.role === 'user';

      return (
        <View
          style={[
            styles.messageRow,
            isUser ? styles.messageRowUser : styles.messageRowAssistant,
          ]}>
          <View
            style={[
              styles.messageBubble,
              isUser ? styles.userBubble : styles.assistantBubble,
            ]}>
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userMessageText : styles.assistantMessageText,
              ]}>
              {item.text}
            </Text>
          </View>
        </View>
      );
    },
    [],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={styles.header}>
          <BackButton onPress={handleBack} />
        </View>

        {isChatActive ? (
          <View style={styles.chatContainer}>
            <View style={styles.watermarkWrap} pointerEvents="none">
              <Image
                source={require('../../../assets/chat-assistant.png')}
                style={styles.watermark}
                resizeMode="contain"
                accessibilityLabel=""
              />
            </View>

            <FlatList
              data={messages}
              keyExtractor={keyExtractor}
              renderItem={renderMessage}
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />

            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor={colors.textMuted}
                value={draft}
                onChangeText={setDraft}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !draft.trim() && styles.sendButtonDisabled,
                ]}
                activeOpacity={0.85}
                onPress={handleSend}
                disabled={!draft.trim()}
                accessibilityRole="button"
                accessibilityLabel="Send message">
                <Send size={18} color={colors.surface} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.content}>
              <View style={styles.mascotGlow} />
              <Image
                source={require('../../../assets/chat-assistant.png')}
                style={styles.mascot}
                resizeMode="contain"
                accessibilityLabel="Chat assistant"
              />
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.startChatButton}
                activeOpacity={0.85}
                onPress={handleStartChat}
                accessibilityRole="button"
                accessibilityLabel="Start chat">
                <MessageCircle
                  size={20}
                  color={colors.surface}
                  strokeWidth={2.5}
                />
                <Text style={styles.startChatButtonText}>Start Chat</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 4,
    zIndex: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenHorizontal,
  },
  mascotGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primaryMuted,
    opacity: 0.45,
  },
  mascot: {
    width: 180,
    height: 180,
  },
  footer: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 24,
  },
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: spacing.cardRadius,
    ...cardShadow,
  },
  startChatButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  chatContainer: {
    flex: 1,
  },
  watermarkWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  watermark: {
    width: 220,
    height: 220,
    opacity: 0.27,
  },
  messageList: {
    flex: 1,
    zIndex: 1,
  },
  messageListContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 16,
    flexGrow: 1,
  },
  messageRow: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  messageRowAssistant: {
    alignSelf: 'flex-start',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...cardShadow,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primaryMuted,
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  assistantMessageText: {
    color: colors.textPrimary,
  },
  userMessageText: {
    color: colors.surface,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 10,
    paddingBottom: 16,
    zIndex: 2,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});

export default ChatbotScreen;

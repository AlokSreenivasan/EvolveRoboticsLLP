import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppButton from '../../../components/AppButton';
import ChatComposer from '../../../components/Chatbot/ChatComposer';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import {
  cardShadowElevated,
  cardShadowLight,
  colors,
  glassBorder,
  spacing,
  typography,
} from '../../../constants/theme';
import { findChatKeywordResponse } from '../../../services/firebase/chatKeywordsService';
import { useChatKeywords } from '../../hooks/useChatKeywords';
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
  const { keywords } = useChatKeywords();
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

  const appendExchange = useCallback(
    (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed) {
        return;
      }

      const response = findChatKeywordResponse(keywords, trimmed);
      const timestamp = Date.now();

      setMessages(current => {
        const nextMessages: ChatMessage[] = [
          ...current,
          { id: `user-${timestamp}`, text: trimmed, role: 'user' },
        ];

        if (response) {
          nextMessages.push({
            id: `assistant-${timestamp}`,
            text: response,
            role: 'assistant',
          });
        }

        return nextMessages;
      });
    },
    [keywords],
  );

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    appendExchange(trimmed);
    setDraft('');
  }, [appendExchange, draft]);

  const handleKeywordPress = useCallback(
    (label: string) => {
      appendExchange(label);
    },
    [appendExchange],
  );

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
        <ScreenHeader
          title="Chat Assistant"
          subtitle={isChatActive ? 'Ask me anything about Evolve' : 'Your robotics learning companion'}
          onBackPress={handleBack}
          compact
        />

        {isChatActive ? (
          <View style={styles.chatContainer}>
            <View style={styles.watermarkWrap} pointerEvents="none">
              <Image
                source={require('../../../assets/chat-assistant.webp')}
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

            <ChatComposer
              keywords={keywords}
              draft={draft}
              onDraftChange={setDraft}
              onSend={handleSend}
              onKeywordPress={handleKeywordPress}
            />
          </View>
        ) : (
          <>
            <View style={styles.content}>
              <View style={styles.mascotGlow} />
              <Image
                source={require('../../../assets/chat-assistant.webp')}
                style={styles.mascot}
                resizeMode="contain"
                accessibilityLabel="Chat assistant"
              />
            </View>

            <View style={styles.footer}>
              <AppButton
                title="Start Chat"
                onPress={handleStartChat}
                variant="primary"
                buttonStyle={styles.startChatButton}
                textStyle={styles.startChatButtonText}
              />
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenHorizontal,
  },
  mascotGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.primaryMuted,
    opacity: 0.5,
    ...cardShadowLight,
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
    gap: 10,
  },
  startChatButtonText: {
    ...typography.button,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.primaryLight,
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
    opacity: 0.22,
  },
  messageList: {
    flex: 1,
    zIndex: 1,
  },
  messageListContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 12,
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
    borderRadius: spacing.cardRadius,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...cardShadowElevated,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    ...glassBorder,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  messageText: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 21,
  },
  assistantMessageText: {
    color: colors.textPrimary,
  },
  userMessageText: {
    color: colors.surface,
  },
});

export default ChatbotScreen;

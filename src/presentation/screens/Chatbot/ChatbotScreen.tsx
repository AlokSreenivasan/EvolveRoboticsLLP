import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RotateCcw } from 'lucide-react-native';

import ChatComposer from '../../../components/Chatbot/ChatComposer';
import ChatMessageBubble from '../../../components/Chatbot/ChatMessageBubble';
import ChatTypingIndicator from '../../../components/Chatbot/ChatTypingIndicator';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import ScreenSafeArea from '../../../components/ui/ScreenSafeArea';
import ScreenStateCard from '../../../components/ui/ScreenStateCard';
import TactileButton from '../../../components/ui/TactileButton';
import {
  colors,
  spacing,
  typography,
} from '../../../constants/theme';
import {
  filterChatKeywordsByQuery,
  findRelatedChatKeywords,
  getStarterChatKeywords,
  resolveAssistantReply,
  UNMATCHED_CHAT_REPLY,
} from '../../../services/firebase/chatKeywordsService';
import type { ChatKeyword } from '../../../store/content/types/chatKeywords.types';
import { useChatKeywords } from '../../hooks/useChatKeywords';
import useChatSession, {
  appendPersistedChatMessage,
  type ChatMessage,
} from '../../hooks/useChatSession';
import type { LoginScreenNavigationProp } from '../../../types/navigation';

const ASSISTANT_REPLY_DELAY_MS = 450;

type PendingReply = {
  exchangeId: number;
  userText: string;
  explicitResponse?: string;
};

function ChatbotScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { keywords: loadedKeywords, loading, error } = useChatKeywords();
  const keywords = useMemo(
    () =>
      loadedKeywords.filter(
        keyword => keyword.label.trim() && keyword.response.trim(),
      ),
    [loadedKeywords],
  );
  const {
    messages,
    setMessages,
    nextExchangeId,
    resetSession,
    hasConversation,
  } = useChatSession();
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [keywordsExpanded, setKeywordsExpanded] = useState(false);
  const messageListRef = useRef<FlatList<ChatMessage>>(null);
  const pendingReplyRef = useRef<PendingReply | null>(null);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keywordsRef = useRef(keywords);
  keywordsRef.current = keywords;

  const lastUserText = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === 'user') {
        return messages[index].text;
      }
    }
    return '';
  }, [messages]);

  const lastAssistantUnmatched =
    messages[messages.length - 1]?.role === 'assistant' &&
    messages[messages.length - 1]?.text === UNMATCHED_CHAT_REPLY;

  const starterKeywords = useMemo(
    () => getStarterChatKeywords(keywords),
    [keywords],
  );

  const relatedKeywords = useMemo(
    () => findRelatedChatKeywords(keywords, lastUserText),
    [keywords, lastUserText],
  );

  const queryTrimmed = draft.trim();
  const isFiltering = queryTrimmed.length >= 2;

  const visibleKeywords = useMemo(() => {
    if (isFiltering) {
      return filterChatKeywordsByQuery(keywords, queryTrimmed);
    }
    if (keywordsExpanded) {
      return keywords;
    }
    if (lastAssistantUnmatched) {
      return relatedKeywords;
    }
    return starterKeywords;
  }, [
    isFiltering,
    keywords,
    keywordsExpanded,
    lastAssistantUnmatched,
    queryTrimmed,
    relatedKeywords,
    starterKeywords,
  ]);

  const canExpandKeywords =
    !isFiltering &&
    !lastAssistantUnmatched &&
    keywords.length > starterKeywords.length;

  const scrollToLatestMessage = useCallback(() => {
    messageListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const clearReplyTimeout = useCallback(() => {
    if (replyTimeoutRef.current) {
      clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = null;
    }
  }, []);

  const commitAssistantReply = useCallback((pending: PendingReply) => {
    const response = resolveAssistantReply(
      keywordsRef.current,
      pending.userText,
      pending.explicitResponse,
    );

    setMessages(current => [
      ...current,
      {
        id: `assistant-${pending.exchangeId}`,
        text: response,
        role: 'assistant',
      },
    ]);
    pendingReplyRef.current = null;
    setIsTyping(false);
  }, [setMessages]);

  const enqueueExchange = useCallback(
    (userText: string, explicitResponse?: string) => {
      const trimmed = userText.trim();
      if (!trimmed || pendingReplyRef.current) {
        return;
      }

      const exchangeId = nextExchangeId();
      const pending: PendingReply = {
        exchangeId,
        userText: trimmed,
        explicitResponse,
      };

      pendingReplyRef.current = pending;
      setKeywordsExpanded(false);
      setMessages(current => [
        ...current,
        { id: `user-${exchangeId}`, text: trimmed, role: 'user' },
      ]);
      setIsTyping(true);

      clearReplyTimeout();
      replyTimeoutRef.current = setTimeout(() => {
        commitAssistantReply(pending);
        replyTimeoutRef.current = null;
      }, ASSISTANT_REPLY_DELAY_MS);
    },
    [clearReplyTimeout, commitAssistantReply, nextExchangeId, setMessages],
  );

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) {
        clearTimeout(replyTimeoutRef.current);
        replyTimeoutRef.current = null;
      }

      const pending = pendingReplyRef.current;
      if (!pending) {
        return;
      }

      pendingReplyRef.current = null;
      appendPersistedChatMessage({
        id: `assistant-${pending.exchangeId}`,
        text: resolveAssistantReply(
          keywordsRef.current,
          pending.userText,
          pending.explicitResponse,
        ),
        role: 'assistant',
      });
    };
  }, []);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleNewChat = useCallback(() => {
    clearReplyTimeout();
    pendingReplyRef.current = null;
    setIsTyping(false);
    setDraft('');
    setKeywordsExpanded(false);
    resetSession();
  }, [clearReplyTimeout, resetSession]);

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    enqueueExchange(trimmed);
    setDraft('');
  }, [draft, enqueueExchange]);

  const handleKeywordPress = useCallback(
    (keyword: ChatKeyword) => {
      enqueueExchange(keyword.label, keyword.response);
      setDraft('');
    },
    [enqueueExchange],
  );

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <ChatMessageBubble role={item.role} text={item.text} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const listHeader = error ? (
    <ScreenStateCard
      variant="error"
      title="Couldn't load topics"
      message="You can still type a message. Suggested topics may be missing."
      style={styles.stateCard}
    />
  ) : null;

  const listFooter = isTyping ? <ChatTypingIndicator /> : null;

  return (
    <ScreenSafeArea style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScreenHeader
          title="Chat Assistant"
          subtitle="Ask me anything about Evolve"
          onBackPress={handleBack}
          compact
          rightSlot={
            hasConversation ? (
              <TactileButton
                variant="ghost"
                style={styles.newChatButton}
                onPress={handleNewChat}
                accessibilityLabel="Start a new chat">
                <RotateCcw size={16} color={colors.primary} strokeWidth={2.5} />
                <Text style={styles.newChatButtonText}>New</Text>
              </TactileButton>
            ) : undefined
          }
        />

        <View style={styles.chatContainer}>
          <FlatList
            ref={messageListRef}
            data={messages}
            keyExtractor={keyExtractor}
            renderItem={renderMessage}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={scrollToLatestMessage}
            ListHeaderComponent={listHeader}
            ListFooterComponent={listFooter}
          />

          <ChatComposer
            keywords={visibleKeywords}
            draft={draft}
            onDraftChange={setDraft}
            onSend={handleSend}
            onKeywordPress={handleKeywordPress}
            disabled={isTyping}
            loadingKeywords={loading && keywords.length === 0}
            canExpandKeywords={canExpandKeywords}
            keywordsExpanded={keywordsExpanded}
            onToggleKeywordsExpanded={() =>
              setKeywordsExpanded(current => !current)
            }
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenSafeArea>
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
  newChatButton: {
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: spacing.chipRadius,
  },
  newChatButtonText: {
    ...typography.label,
    fontWeight: '800',
    color: colors.primary,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 12,
    paddingBottom: 16,
    flexGrow: 1,
  },
  stateCard: {
    marginBottom: 16,
    paddingVertical: 18,
  },
});

export default ChatbotScreen;

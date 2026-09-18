import { useCallback, useRef, useState } from 'react';

export type ChatMessage = {
  id: string;
  text: string;
  role: 'user' | 'assistant';
};

export const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  text: "Hi! I'm your Evolve assistant. How can I help you today?",
  role: 'assistant',
};

type ChatSessionState = {
  messages: ChatMessage[];
  nextId: number;
};

const session: ChatSessionState = {
  messages: [WELCOME_MESSAGE],
  nextId: 0,
};

export function appendPersistedChatMessage(message: ChatMessage) {
  session.messages = [...session.messages, message];
}

function useChatSession() {
  const [messages, setMessagesState] = useState<ChatMessage[]>(
    () => session.messages,
  );
  const nextIdRef = useRef(session.nextId);

  const setMessages = useCallback(
    (update: ChatMessage[] | ((current: ChatMessage[]) => ChatMessage[])) => {
      setMessagesState(current => {
        const next = typeof update === 'function' ? update(current) : update;
        session.messages = next;
        return next;
      });
    },
    [],
  );

  const nextExchangeId = useCallback(() => {
    nextIdRef.current += 1;
    session.nextId = nextIdRef.current;
    return nextIdRef.current;
  }, []);

  const resetSession = useCallback(() => {
    nextIdRef.current = 0;
    session.nextId = 0;
    session.messages = [WELCOME_MESSAGE];
    setMessagesState([WELCOME_MESSAGE]);
  }, []);

  const hasConversation = messages.some(message => message.role === 'user');

  return {
    messages,
    setMessages,
    nextExchangeId,
    resetSession,
    hasConversation,
  };
}

export default useChatSession;

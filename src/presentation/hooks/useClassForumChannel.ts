import { useEffect, useState } from 'react';

import {
  subscribeClassForumChannel,
  subscribeClassForumMessages,
} from '../../services/firebase/classForumService';
import type {
  ClassForumChannel,
  ClassForumMessage,
} from '../../store/content/types/classForum.types';
import { getErrorMessage } from '../../utils/firebase';

export function useClassForumChannel(channelId: string | undefined) {
  const [channel, setChannel] = useState<ClassForumChannel | null>(null);
  const [messages, setMessages] = useState<ClassForumMessage[]>([]);
  const [loading, setLoading] = useState(Boolean(channelId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!channelId) {
      setChannel(null);
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    let channelReady = false;
    let messagesReady = false;

    const markReady = () => {
      if (channelReady && messagesReady) {
        setLoading(false);
      }
    };

    const unsubChannel = subscribeClassForumChannel(
      channelId,
      next => {
        setChannel(next);
        channelReady = true;
        markReady();
        setError(null);
      },
      err => {
        channelReady = true;
        markReady();
        setError(getErrorMessage(err));
      },
    );

    const unsubMessages = subscribeClassForumMessages(
      channelId,
      next => {
        setMessages(next);
        messagesReady = true;
        markReady();
      },
      err => {
        messagesReady = true;
        markReady();
        setError(getErrorMessage(err));
      },
    );

    return () => {
      unsubChannel();
      unsubMessages();
    };
  }, [channelId]);

  return { channel, messages, loading, error };
}

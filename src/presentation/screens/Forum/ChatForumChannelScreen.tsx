import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Lock, LockOpen, MessagesSquare } from 'lucide-react-native';

import ForumComposer from '../../../components/Forum/ForumComposer';
import ForumMessageBubble from '../../../components/Forum/ForumMessageBubble';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import ScreenStateCard from '../../../components/ui/ScreenStateCard';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors } from '../../../constants/theme';
import {
  deleteClassForumMessage,
  postClassForumMessage,
  reportClassForumMessage,
  setClassForumChannelLocked,
  setClassForumMessagePinned,
} from '../../../services/firebase/classForumService';
import type { ClassForumMessage } from '../../../store/content/types/classForum.types';
import type {
  LoginScreenNavigationProp,
  RootStackParamList,
} from '../../../types/navigation';
import { appAlert, appAlertConfirm } from '../../../utils/alert/appAlert';
import { getErrorMessage } from '../../../utils/firebase';
import {
  canLockClassForum,
  canPostInClassForum,
} from '../../../utils/forum/classForumPermissions';
import { useAuth } from '../../context/AuthContext';
import { useClassForumChannel } from '../../hooks/useClassForumChannel';
import { useUserRole } from '../../hooks/useUserRole';

function ChatForumChannelScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChatForumChannel'>>();
  const { channelId, title: initialTitle } = route.params;
  const { user, profile, displayName } = useAuth();
  const { role } = useUserRole();
  const { channel, messages, loading, error } = useClassForumChannel(channelId);

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ClassForumMessage>>(null);

  const headerTitle = channel?.title || initialTitle || 'Class Forum';
  const isLocked = channel?.isLocked === true;
  const canPost = canPostInClassForum(role, isLocked);
  const canLock = canLockClassForum(role);

  const sortedMessages = useMemo(() => {
    const pinned = messages.filter(item => item.isPinned);
    const rest = messages.filter(item => !item.isPinned);
    return [...pinned, ...rest];
  }, [messages]);

  useEffect(() => {
    if (sortedMessages.length === 0) {
      return;
    }
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(timer);
  }, [sortedMessages.length]);

  const handleSend = useCallback(async () => {
    if (!user?.uid || !canPost || sending) {
      return;
    }
    const text = draft;
    setSending(true);
    try {
      await postClassForumMessage(channelId, {
        text,
        senderId: user.uid,
        senderName: displayName || profile?.fullName || 'Member',
        senderRole: role,
      });
      setDraft('');
    } catch (err) {
      appAlert('Couldn’t send', getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }, [
    canPost,
    channelId,
    displayName,
    draft,
    profile?.fullName,
    role,
    sending,
    user?.uid,
  ]);

  const handleDelete = useCallback(
    (message: ClassForumMessage) => {
      appAlertConfirm(
        'Delete message?',
        'This removes the message from the class forum.',
        async () => {
          try {
            await deleteClassForumMessage(channelId, message.id);
          } catch (err) {
            appAlert(
              'Couldn’t delete',
              getErrorMessage(err),
            );
          }
        },
        { destructive: true, confirmLabel: 'Delete' },
      );
    },
    [channelId],
  );

  const handleReport = useCallback(
    (message: ClassForumMessage) => {
      if (!user?.uid) {
        return;
      }
      appAlertConfirm(
        'Report message?',
        'Facilitators will review this report.',
        async () => {
          try {
            await reportClassForumMessage(channelId, {
              messageId: message.id,
              messageText: message.text,
              reportedSenderId: message.senderId,
              reporterId: user.uid,
              reporterName: displayName || profile?.fullName || 'Member',
              reason: 'Inappropriate or unsafe',
            });
            appAlert('Reported', 'Thanks — a facilitator can review this.');
          } catch (err) {
            appAlert(
              'Couldn’t report',
              getErrorMessage(err),
            );
          }
        },
        { confirmLabel: 'Report', destructive: true },
      );
    },
    [channelId, displayName, profile?.fullName, user?.uid],
  );

  const handleTogglePin = useCallback(
    async (message: ClassForumMessage) => {
      try {
        await setClassForumMessagePinned(
          channelId,
          message.id,
          !message.isPinned,
        );
      } catch (err) {
        appAlert('Couldn’t update pin', getErrorMessage(err));
      }
    },
    [channelId],
  );

  const handleToggleLock = useCallback(() => {
    if (!canLock) {
      return;
    }
    const nextLocked = !isLocked;
    appAlertConfirm(
      nextLocked ? 'Lock forum?' : 'Unlock forum?',
      nextLocked
        ? 'Students won’t be able to post until it’s unlocked.'
        : 'Students can post again in this class forum.',
      async () => {
        try {
          await setClassForumChannelLocked(channelId, nextLocked);
        } catch (err) {
          appAlert(
            'Couldn’t update lock',
            getErrorMessage(err),
          );
        }
      },
      { confirmLabel: nextLocked ? 'Lock' : 'Unlock' },
    );
  }, [canLock, channelId, isLocked]);

  const renderItem = useCallback(
    ({ item }: { item: ClassForumMessage }) => (
      <ForumMessageBubble
        message={item}
        currentUserId={user?.uid}
        currentRole={role}
        onDelete={handleDelete}
        onReport={handleReport}
        onTogglePin={handleTogglePin}
      />
    ),
    [handleDelete, handleReport, handleTogglePin, role, user?.uid],
  );

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ScreenStateCard variant="loading" />;
    }
    if (error) {
      return (
        <ScreenStateCard
          variant="error"
          title="Could not load forum"
          message={error}
          Icon={MessagesSquare}
        />
      );
    }
    return (
      <ScreenStateCard
        variant="empty"
        title="Start the conversation"
        message="Ask questions, share progress, and keep your class learning together."
        Icon={MessagesSquare}
      />
    );
  }, [error, loading]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={headerTitle}
        subtitle={isLocked ? 'Locked · facilitators can still post' : 'Class forum'}
        onBackPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }}
        rightSlot={
          canLock ? (
            <TouchableOpacity
              style={styles.lockBtn}
              onPress={handleToggleLock}
              accessibilityRole="button"
              accessibilityLabel={isLocked ? 'Unlock forum' : 'Lock forum'}>
              {isLocked ? (
                <Lock size={18} color={colors.primary} strokeWidth={2.2} />
              ) : (
                <LockOpen size={18} color={colors.primary} strokeWidth={2.2} />
              )}
            </TouchableOpacity>
          ) : null
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <FlatList
          ref={listRef}
          data={loading || error ? [] : sortedMessages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          {...VERTICAL_LIST_PERF}
        />

        <ForumComposer
          draft={draft}
          onDraftChange={setDraft}
          onSend={() => {
            handleSend().catch(() => undefined);
          }}
          disabled={!canPost || sending}
          placeholder={
            canPost
              ? 'Write a message…'
              : 'Forum locked — only facilitators can post'
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 4,
    paddingBottom: 16,
  },
  lockBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
});

export default ChatForumChannelScreen;

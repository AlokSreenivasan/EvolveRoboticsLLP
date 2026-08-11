import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Flag, Pin, Trash2 } from 'lucide-react-native';

import {
  cardShadowLight,
  colors,
  glassBorder,
  spacing,
} from '../../constants/theme';
import type { ClassForumMessage } from '../../store/content/types/classForum.types';
import type { UserRole } from '../../store/user/types/role.types';
import {
  canDeleteOwnClassForumMessage,
  canPinClassForumMessage,
  forumRoleLabel,
} from '../../utils/forum/classForumPermissions';

type ForumMessageBubbleProps = {
  message: ClassForumMessage;
  currentUserId: string | null | undefined;
  currentRole: UserRole;
  onDelete: (message: ClassForumMessage) => void;
  onReport: (message: ClassForumMessage) => void;
  onTogglePin: (message: ClassForumMessage) => void;
};

function formatTime(message: ClassForumMessage): string {
  if (!message.createdAt) {
    return '';
  }
  try {
    return message.createdAt.toDate().toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function ForumMessageBubble({
  message,
  currentUserId,
  currentRole,
  onDelete,
  onReport,
  onTogglePin,
}: ForumMessageBubbleProps) {
  const isMine = message.senderId === currentUserId;
  const canDelete = canDeleteOwnClassForumMessage(
    currentRole,
    message.senderId,
    currentUserId,
  );
  const canPin = canPinClassForumMessage(currentRole);
  const canReport = Boolean(currentUserId) && !isMine;

  const roleLabel = useMemo(
    () => forumRoleLabel(message.senderRole),
    [message.senderRole],
  );

  return (
    <View
      style={[styles.row, isMine ? styles.rowMine : styles.rowOther]}
      accessibilityRole="text">
      <View
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleOther,
          message.isPinned && styles.bubblePinned,
        ]}>
        <View style={styles.metaRow}>
          <Text
            style={[styles.sender, isMine && styles.senderMine]}
            numberOfLines={1}>
            {isMine ? 'You' : message.senderName}
          </Text>
          {message.senderRole !== 'user' ? (
            <Text style={[styles.roleChip, isMine && styles.roleChipMine]}>
              {roleLabel}
            </Text>
          ) : null}
          {message.isPinned ? (
            <Text style={styles.pinnedChip}>Pinned</Text>
          ) : null}
        </View>
        <Text style={[styles.text, isMine && styles.textMine]}>
          {message.text}
        </Text>
        <Text style={[styles.time, isMine && styles.timeMine]}>
          {formatTime(message)}
        </Text>
        <View style={styles.actions}>
          {canPin ? (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onTogglePin(message)}
              accessibilityRole="button"
              accessibilityLabel={
                message.isPinned ? 'Unpin message' : 'Pin message'
              }>
              <Pin
                size={14}
                color={colors.primary}
                strokeWidth={2.2}
                fill={message.isPinned ? colors.primary : 'transparent'}
              />
            </TouchableOpacity>
          ) : null}
          {canReport ? (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onReport(message)}
              accessibilityRole="button"
              accessibilityLabel="Report message">
              <Flag size={14} color={colors.textSecondary} strokeWidth={2.2} />
            </TouchableOpacity>
          ) : null}
          {canDelete ? (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onDelete(message)}
              accessibilityRole="button"
              accessibilityLabel="Delete message">
              <Trash2 size={14} color={colors.danger} strokeWidth={2.2} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 10,
    paddingHorizontal: spacing.screenHorizontal,
  },
  rowMine: {
    alignItems: 'flex-end',
  },
  rowOther: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    ...glassBorder,
    ...cardShadowLight,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
  },
  bubblePinned: {
    borderColor: colors.accentOrange,
    borderWidth: 1.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  sender: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    maxWidth: 160,
  },
  senderMine: {
    color: 'rgba(255,255,255,0.9)',
  },
  roleChip: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleChipMine: {
    color: colors.surface,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  pinnedChip: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentOrange,
    backgroundColor: colors.warningLight,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  textMine: {
    color: colors.surface,
  },
  time: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  timeMine: {
    color: 'rgba(255,255,255,0.75)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 6,
  },
  actionBtn: {
    padding: 4,
  },
});

export default React.memo(ForumMessageBubble);

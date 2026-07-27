import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Bell, CheckCheck } from 'lucide-react-native';

import {
  cardShadow,
  colors,
  glassBorder,
  spacing,
  typography,
} from '../../constants/theme';
import type { LearnerNotification } from '../../store/content/types/notifications.types';
import { formatNotificationTimestamp } from '../../utils/formatNotificationTimestamp';

type NotificationItemCardProps = {
  notification: Pick<
    LearnerNotification,
    'id' | 'title' | 'body' | 'createdAt' | 'updatedAt' | 'isRead'
  >;
  variant?: 'default' | 'list';
  onMarkRead?: (notificationId: string) => Promise<void> | void;
};

function NotificationItemCard({
  notification,
  variant = 'default',
  onMarkRead,
}: NotificationItemCardProps) {
  const body = notification.body?.trim();
  const isList = variant === 'list';
  const isRead = notification.isRead === true;
  const canMarkRead = Boolean(onMarkRead) && !isRead;
  const [marking, setMarking] = useState(false);
  const timestamp = isList
    ? formatNotificationTimestamp(
        notification.createdAt,
        notification.updatedAt,
      )
    : null;

  const markRead = useCallback(async () => {
    if (!canMarkRead || !onMarkRead || marking) {
      return;
    }
    setMarking(true);
    try {
      await onMarkRead(notification.id);
    } finally {
      setMarking(false);
    }
  }, [canMarkRead, marking, notification.id, onMarkRead]);

  return (
    <View
      style={[
        styles.card,
        isList && styles.cardList,
        isRead ? styles.cardRead : styles.cardUnread,
      ]}>
      <View
        style={[styles.accent, isRead ? styles.accentRead : styles.accentUnread]}
      />

      <Pressable
        accessibilityRole={canMarkRead ? 'button' : 'text'}
        accessibilityLabel={
          isRead
            ? `Read notification: ${notification.title}`
            : `Unread notification: ${notification.title}. Double tap to open and mark as read.`
        }
        disabled={!canMarkRead || marking}
        onPress={markRead}
        style={({ pressed }) => [
          styles.mainPressable,
          pressed && canMarkRead && styles.cardPressed,
        ]}>
        <View
          style={[
            styles.iconWrap,
            isRead ? styles.iconWrapRead : styles.iconWrapUnread,
          ]}>
          <Bell
            size={isList ? 24 : 22}
            color={isRead ? colors.textMuted : colors.primary}
            strokeWidth={2}
          />
          {!isRead ? <View style={styles.unreadDot} /> : null}
        </View>

        <View style={styles.content}>
          <View style={[styles.titleRow, body ? styles.titleRowWithBody : null]}>
            <Text
              style={[
                styles.title,
                isList && styles.titleList,
                isRead && styles.titleRead,
              ]}
              numberOfLines={2}>
              {notification.title}
            </Text>
            <View style={styles.metaColumn}>
              {timestamp ? (
                <Text style={styles.timestamp}>{timestamp}</Text>
              ) : null}
              <Text
                style={[
                  styles.statusLabel,
                  isRead ? styles.statusRead : styles.statusUnread,
                ]}>
                {isRead ? 'Read' : 'Unread'}
              </Text>
            </View>
          </View>
          {body ? (
            <Text
              style={[
                styles.body,
                isList && styles.bodyList,
                isRead && styles.bodyRead,
              ]}>
              {body}
            </Text>
          ) : null}
        </View>
      </Pressable>

      {isList && canMarkRead ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mark as read"
          onPress={markRead}
          disabled={marking}
          hitSlop={8}
          style={({ pressed }) => [
            styles.markReadButton,
            pressed && styles.markReadButtonPressed,
          ]}>
          {marking ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <CheckCheck size={16} color={colors.primary} strokeWidth={2.25} />
              <Text style={styles.markReadButtonText}>Mark as read</Text>
            </>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.cardRadiusLg,
    padding: 16,
    paddingLeft: 20,
    overflow: 'hidden',
    ...glassBorder,
    ...cardShadow,
  },
  cardList: {
    paddingVertical: 18,
  },
  cardUnread: {
    backgroundColor: colors.noticeBackground,
    borderColor: colors.noticeBorder,
  },
  cardRead: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.92,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: spacing.cardRadiusLg,
    borderBottomLeftRadius: spacing.cardRadiusLg,
  },
  accentUnread: {
    backgroundColor: colors.primary,
  },
  accentRead: {
    backgroundColor: colors.border,
  },
  mainPressable: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconWrapUnread: {
    backgroundColor: colors.surface,
  },
  iconWrapRead: {
    backgroundColor: colors.background,
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleRowWithBody: {
    marginBottom: 6,
  },
  metaColumn: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statusUnread: {
    color: colors.primary,
  },
  statusRead: {
    color: colors.textMuted,
  },
  title: {
    flex: 1,
    ...typography.cardTitle,
    fontSize: 15,
    lineHeight: 20,
  },
  titleList: {
    fontSize: 16,
    lineHeight: 22,
  },
  titleRead: {
    fontWeight: '600',
    color: colors.textSecondary,
  },
  body: {
    ...typography.bodySecondary,
  },
  bodyList: {
    fontSize: 14,
    lineHeight: 21,
  },
  bodyRead: {
    color: colors.textMuted,
  },
  markReadButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginLeft: 62,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: spacing.chipRadius,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    minHeight: 34,
  },
  markReadButtonPressed: {
    opacity: 0.85,
    backgroundColor: colors.primaryMuted,
  },
  markReadButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default React.memo(NotificationItemCard);

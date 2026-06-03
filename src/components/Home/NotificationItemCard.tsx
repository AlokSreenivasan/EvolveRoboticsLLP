import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bell } from 'lucide-react-native';

import { cardShadowLight, colors } from '../../constants/theme';
import type { AppNotification } from '../../store/content/types/notifications.types';
import { formatNotificationTimestamp } from '../../utils/formatNotificationTimestamp';

type NotificationItemCardProps = {
  notification: Pick<
    AppNotification,
    'title' | 'body' | 'createdAt' | 'updatedAt'
  >;
  variant?: 'default' | 'list';
};

function NotificationItemCard({
  notification,
  variant = 'default',
}: NotificationItemCardProps) {
  const body = notification.body?.trim();
  const timestamp = formatNotificationTimestamp(
    notification.createdAt,
    notification.updatedAt,
  );
  const isList = variant === 'list';

  return (
    <View style={[styles.card, isList && styles.cardList]}>
      <View style={styles.accent} />
      <View style={styles.iconWrap}>
        <Bell size={isList ? 24 : 22} color={colors.primary} strokeWidth={2} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.badge, isList && styles.badgeList]}>
            Announcement
          </Text>
          {timestamp ? (
            <Text style={styles.timestamp}>{timestamp}</Text>
          ) : null}
        </View>
        <Text style={[styles.title, isList && styles.titleList]}>
          {notification.title}
        </Text>
        {body ? (
          <Text style={[styles.body, isList && styles.bodyList]}>{body}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.noticeBackground,
    borderRadius: 16,
    padding: 16,
    paddingLeft: 20,
    borderWidth: 1,
    borderColor: colors.noticeBorder,
    overflow: 'hidden',
    ...cardShadowLight,
  },
  cardList: {
    paddingVertical: 18,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  badgeList: {
    fontSize: 12,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    flexShrink: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  titleList: {
    fontSize: 16,
    lineHeight: 22,
  },
  body: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  bodyList: {
    fontSize: 14,
    lineHeight: 21,
  },
});

export default React.memo(NotificationItemCard);

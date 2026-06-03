import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bell } from 'lucide-react-native';

import { cardShadowLight, colors } from '../../constants/theme';
import type { AppNotification } from '../../store/content/types/notifications.types';

type NotificationItemCardProps = {
  notification: Pick<AppNotification, 'title' | 'body'>;
};

function NotificationItemCard({ notification }: NotificationItemCardProps) {
  const body = notification.body?.trim();

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Bell size={22} color={colors.primary} strokeWidth={2} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        {body ? <Text style={styles.body}>{body}</Text> : null}
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
    borderWidth: 1,
    borderColor: colors.noticeBorder,
    ...cardShadowLight,
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
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default React.memo(NotificationItemCard);

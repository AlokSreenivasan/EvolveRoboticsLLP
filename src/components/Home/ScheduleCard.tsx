import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  ClipboardList,
  FlaskConical,
  MessageCircle,
  Video,
} from 'lucide-react-native';

import { cardShadowLight, colors } from '../../constants/theme';

type ScheduleItem = {
  id: string;
  time: string;
  title: string;
  type: string;
  accentColor: string;
  backgroundColor: string;
  iconName: 'video' | 'flask' | 'message' | 'clipboard';
};

type ScheduleCardProps = {
  item: ScheduleItem;
};

function ScheduleIcon({ name, color }: { name: ScheduleItem['iconName']; color: string }) {
  const size = 18;
  const stroke = 2;

  switch (name) {
    case 'video':
      return <Video size={size} color={color} strokeWidth={stroke} />;
    case 'flask':
      return <FlaskConical size={size} color={color} strokeWidth={stroke} />;
    case 'message':
      return <MessageCircle size={size} color={color} strokeWidth={stroke} />;
    case 'clipboard':
      return <ClipboardList size={size} color={color} strokeWidth={stroke} />;
    default:
      return null;
  }
}

function ScheduleCard({ item }: ScheduleCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: item.backgroundColor,
          borderLeftColor: item.accentColor,
        },
      ]}>
      <Text style={styles.time}>{item.time}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.type}>{item.type}</Text>
      <View style={styles.iconCorner}>
        <ScheduleIcon name={item.iconName} color={item.accentColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 132,
    minHeight: 148,
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    ...cardShadowLight,
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  type: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  iconCorner: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
});

export default ScheduleCard;

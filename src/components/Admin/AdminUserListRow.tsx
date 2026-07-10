import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Mail, Phone, RotateCcw, User } from 'lucide-react-native';

import AdminIconButton from './AdminIconButton';
import { colors, cardShadow } from '../../constants/theme';

type AdminUserListRowProps = {
  fullName: string;
  email: string;
  phoneNumber: string;
  onResetQuizProgress?: () => void;
  resettingQuizProgress?: boolean;
};

function displayName(fullName: string): string {
  const trimmed = fullName.trim();
  return trimmed.length > 0 ? trimmed : 'No name';
}

function displayValue(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function AdminUserListRow({
  fullName,
  email,
  phoneNumber,
  onResetQuizProgress,
  resettingQuizProgress,
}: AdminUserListRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.nameRow}>
        <View style={styles.iconWrap}>
          <User size={18} color={colors.primary} strokeWidth={2} />
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {displayName(fullName)}
        </Text>
        {onResetQuizProgress ? (
          resettingQuizProgress ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <AdminIconButton icon={RotateCcw} onPress={onResetQuizProgress} />
          )
        ) : null}
      </View>
      <View style={styles.detailRow}>
        <Mail size={14} color={colors.textMuted} strokeWidth={2} />
        <Text style={styles.detailText} numberOfLines={1}>
          {displayValue(email, 'No email')}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Phone size={14} color={colors.textMuted} strokeWidth={2} />
        <Text style={styles.detailText} numberOfLines={1}>
          {displayValue(phoneNumber, 'No phone')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    ...cardShadow,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 42,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default AdminUserListRow;

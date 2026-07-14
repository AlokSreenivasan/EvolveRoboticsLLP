import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GraduationCap,
  Mail,
  Phone,
  RotateCcw,
  School,
  Shield,
  User,
} from 'lucide-react-native';

import type { UserRole } from '../../store/user/types/role.types';
import { colors, cardShadow } from '../../constants/theme';
import { roleDisplayLabel } from '../../utils/role/normalizeUserRole';
import AdminIconButton from './AdminIconButton';

type RoleAssignmentTarget = 'admin';

type AdminUserListRowProps = {
  fullName: string;
  email: string;
  phoneNumber: string;
  role?: UserRole;
  schoolLabel?: string | null;
  gradeLabel?: string | null;
  roleAssignmentTarget?: RoleAssignmentTarget;
  onResetQuizProgress?: () => void;
  resettingQuizProgress?: boolean;
  onToggleRole?: () => void;
  updatingRole?: boolean;
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
  role,
  schoolLabel,
  gradeLabel,
  roleAssignmentTarget = 'admin',
  onResetQuizProgress,
  resettingQuizProgress,
  onToggleRole,
  updatingRole,
}: AdminUserListRowProps) {
  const isSuperAdmin = role === 'superadmin';
  const isAdmin = role === 'admin';
  const isElevatedRole = isSuperAdmin || isAdmin;
  const canToggleRole =
    onToggleRole != null &&
    roleAssignmentTarget === 'admin' &&
    role != null &&
    (role === 'user' || role === 'admin');

  const roleActionLabel = isAdmin ? 'Make user' : 'Make admin';
  const roleActionAccessibilityLabel = isAdmin
    ? 'Remove admin access'
    : 'Grant admin access';

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
      {role ? (
        <View style={styles.roleRow}>
          <View
            style={[
              styles.roleBadge,
              isSuperAdmin
                ? styles.roleBadgeSuper
                : isAdmin
                  ? styles.roleBadgeAdmin
                  : styles.roleBadgeUser,
            ]}>
            <Shield
              size={12}
              color={isElevatedRole ? colors.primary : colors.textMuted}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.roleBadgeText,
                isElevatedRole ? styles.roleBadgeTextElevated : null,
              ]}>
              {roleDisplayLabel(role)}
            </Text>
          </View>
          {canToggleRole ? (
            updatingRole ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Pressable
                onPress={onToggleRole}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={roleActionAccessibilityLabel}>
                <Text style={styles.roleAction}>{roleActionLabel}</Text>
              </Pressable>
            )
          ) : null}
        </View>
      ) : null}
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
      {schoolLabel ? (
        <View style={styles.detailRow}>
          <School size={14} color={colors.textMuted} strokeWidth={2} />
          <Text style={styles.detailText} numberOfLines={1}>
            {schoolLabel}
          </Text>
        </View>
      ) : null}
      {gradeLabel ? (
        <View style={styles.detailRow}>
          <GraduationCap size={14} color={colors.textMuted} strokeWidth={2} />
          <Text style={styles.detailText} numberOfLines={1}>
            {gradeLabel}
          </Text>
        </View>
      ) : null}
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
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingLeft: 42,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleBadgeUser: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  roleBadgeSuper: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  roleBadgeAdmin: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  roleBadgeTextElevated: {
    color: colors.primary,
  },
  roleAction: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
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

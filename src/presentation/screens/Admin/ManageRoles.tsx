import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Search } from 'lucide-react-native';

import AdminScreenLayout from '../../../components/Admin/AdminScreenLayout';
import AdminUserFilters from '../../../components/Admin/AdminUserFilters';
import AdminUserListRow from '../../../components/Admin/AdminUserListRow';
import { adminStyles } from '../../../components/Admin/adminStyles';
import { getGradeLabel } from '../../../constants/gradeOptions';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors } from '../../../constants/theme';
import { useAdminUsersList } from '../../hooks/admin/useAdminUsersList';
import { useSchools } from '../../hooks/useSchools';
import { setUserRole } from '../../../services/firebase/adminUsersService';
import { isSuperAdmin } from '../../../services/firebase/roleService';
import type { AdminUserListItem } from '../../../store/user/types/adminUsers.types';
import type { AssignableUserRole } from '../../../store/user/types/role.types';
import { toRoleWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';
import { roleDisplayLabel } from '../../../utils/role/normalizeUserRole';
import { useAuth } from '../../context/AuthContext';

function displayUserLabel(user: AdminUserListItem): string {
  const name = user.fullName.trim();
  if (name.length > 0) {
    return name;
  }
  const email = user.email.trim();
  if (email.length > 0) {
    return email;
  }
  return 'this user';
}

function ManageRoles() {
  const { user: authUser } = useAuth();
  const [updatingRoleUid, setUpdatingRoleUid] = useState<string | null>(null);
  const { schools, loading: schoolsLoading } = useSchools();
  const {
    users,
    searchTerm,
    setSearchTerm,
    selectedSchoolId,
    setSelectedSchoolId,
    selectedGrade,
    setSelectedGrade,
    clearFilters,
    hasActiveFilters,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    error,
    loadMore,
    refresh,
  } = useAdminUsersList();

  const schoolNameById = useCallback(
    (schoolId: string | null) => {
      if (!schoolId) {
        return null;
      }
      return schools.find(school => school.id === schoolId)?.name ?? null;
    },
    [schools],
  );

  const confirmToggleAdminRole = useCallback(
    (targetUser: AdminUserListItem) => {
      if (targetUser.role === 'superadmin') {
        return;
      }

      const label = displayUserLabel(targetUser);
      const nextRole: AssignableUserRole =
        targetUser.role === 'admin' ? 'user' : 'admin';
      const confirmMessage =
        nextRole === 'admin'
          ? appAlertCopy.admin.grantAdminConfirm(label)
          : appAlertCopy.admin.revokeAdminConfirm(label);

      appAlert(appAlertCopy.admin.changeRoleConfirmTitle, confirmMessage, [
        { text: appAlertButtons.cancel, style: 'cancel' },
        {
          text: appAlertButtons.confirm,
          style: nextRole === 'user' ? 'destructive' : 'default',
          onPress: async () => {
            setUpdatingRoleUid(targetUser.uid);
            try {
              const canChangeRoles = await isSuperAdmin();
              if (!canChangeRoles) {
                appAlert(
                  appAlertCopy.admin.superadminAccessRequiredTitle,
                  appAlertCopy.admin.superadminAccessRequired(authUser?.uid),
                );
                return;
              }

              await setUserRole(targetUser.uid, nextRole);
              await refresh();
              appAlert(
                appAlertCopy.admin.roleUpdatedTitle,
                appAlertCopy.admin.roleUpdatedSuccess(
                  label,
                  roleDisplayLabel(nextRole).toLowerCase(),
                ),
              );
            } catch (roleError) {
              appAlert(
                appAlertCopy.admin.saveFailedTitle,
                toRoleWriteErrorMessage(roleError, authUser?.uid),
              );
            } finally {
              setUpdatingRoleUid(null);
            }
          },
        },
      ]);
    },
    [authUser?.uid, refresh],
  );

  const renderItem = useCallback(
    ({ item }: { item: AdminUserListItem }) => (
      <AdminUserListRow
        fullName={item.fullName}
        email={item.email}
        phoneNumber={item.phoneNumber}
        role={item.role}
        schoolLabel={schoolNameById(item.schoolId)}
        gradeLabel={getGradeLabel(item.grade)}
        roleAssignmentTarget="admin"
        onToggleRole={() => confirmToggleAdminRole(item)}
        updatingRole={updatingRoleUid === item.uid}
      />
    ),
    [confirmToggleAdminRole, schoolNameById, updatingRoleUid],
  );

  const keyExtractor = useCallback((item: AdminUserListItem) => item.uid, []);

  const listHeader = (
    <View style={styles.headerBlock}>
      <Text style={styles.infoText}>
        Grant admin access so a user can open the admin dashboard and manage
        Resources, Assignments, Exams, and Quiz Competition. Superadmin accounts
        cannot be changed from this screen.
      </Text>
      <AdminUserFilters
        schools={schools}
        schoolsLoading={schoolsLoading}
        selectedSchoolId={selectedSchoolId}
        onSelectSchool={setSelectedSchoolId}
        selectedGrade={selectedGrade}
        onSelectGrade={setSelectedGrade}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
      <View style={styles.searchWrap}>
        <Search size={18} color={colors.textMuted} strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search by name or email"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>
      <Text style={styles.searchHint}>
        Type at least 2 characters to search by name or email. Use digits only
        to search by phone (3+ digits). Results load in pages — scroll for more.
      </Text>
      {!loading && !error && users.length > 0 ? (
        <Text style={styles.countLabel}>
          {users.length} user{users.length === 1 ? '' : 's'} loaded
          {hasMore ? ' · scroll for more' : ''}
        </Text>
      ) : null}
    </View>
  );

  const listEmpty = useCallback(() => {
    if (loading) {
      return (
        <ActivityIndicator color={colors.primary} style={adminStyles.loader} />
      );
    }
    if (error) {
      return <Text style={adminStyles.emptyText}>{error}</Text>;
    }
    return (
      <Text style={adminStyles.emptyText}>
        {searchTerm.trim().length > 0 || hasActiveFilters
          ? 'No users match your search or filters.'
          : 'No users found yet.'}
      </Text>
    );
  }, [error, hasActiveFilters, loading, searchTerm]);

  const listFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <ActivityIndicator
          color={colors.primary}
          style={styles.footerLoader}
        />
      );
    }
    if (!loading && !error && users.length > 0 && !hasMore) {
      return <Text style={styles.endLabel}>End of list</Text>;
    }
    return null;
  }, [error, hasMore, loading, loadingMore, users.length]);

  return (
    <AdminScreenLayout
      title="Roles"
      subtitle="Assign admin access"
      scrollable={false}>
      <FlatList
        data={loading && users.length === 0 ? [] : users}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={adminStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
        {...VERTICAL_LIST_PERF}
      />
    </AdminScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    padding: 0,
  },
  searchHint: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  countLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  footerLoader: {
    marginVertical: 16,
  },
  endLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginVertical: 16,
  },
});

export default ManageRoles;

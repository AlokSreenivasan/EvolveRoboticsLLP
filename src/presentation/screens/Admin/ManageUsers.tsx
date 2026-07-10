import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Search } from 'lucide-react-native';

import AdminScreenLayout from '../../../components/Admin/AdminScreenLayout';
import AdminUserListRow from '../../../components/Admin/AdminUserListRow';
import { adminStyles } from '../../../components/Admin/adminStyles';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors } from '../../../constants/theme';
import { useAdminUsersList } from '../../hooks/admin/useAdminUsersList';
import { resetUserQuizProgress } from '../../../services/firebase/adminQuizProgressService';
import type { AdminUserListItem } from '../../../store/user/types/adminUsers.types';
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';

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

function ManageUsers() {
  const [resettingUid, setResettingUid] = useState<string | null>(null);
  const {
    users,
    searchTerm,
    setSearchTerm,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    error,
    loadMore,
    refresh,
  } = useAdminUsersList();

  const confirmResetQuizProgress = useCallback((user: AdminUserListItem) => {
    const label = displayUserLabel(user);
    Alert.alert(
      'Reset quiz progress',
      `Clear all quiz competition progress for ${label}? They will need to start from the first quiz again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setResettingUid(user.uid);
            try {
              await resetUserQuizProgress(user.uid);
              Alert.alert(
                'Quiz progress reset',
                `Quiz progress for ${label} has been cleared.`,
              );
            } catch (resetError) {
              Alert.alert(
                'Reset failed',
                toAdminWriteErrorMessage(resetError),
              );
            } finally {
              setResettingUid(null);
            }
          },
        },
      ],
    );
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: AdminUserListItem }) => (
      <AdminUserListRow
        fullName={item.fullName}
        email={item.email}
        phoneNumber={item.phoneNumber}
        onResetQuizProgress={() => confirmResetQuizProgress(item)}
        resettingQuizProgress={resettingUid === item.uid}
      />
    ),
    [confirmResetQuizProgress, resettingUid],
  );

  const keyExtractor = useCallback((item: AdminUserListItem) => item.uid, []);

  const listHeader = (
    <View style={styles.headerBlock}>
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
      return (
        <Text style={adminStyles.emptyText}>
          {toAdminWriteErrorMessage(error)}
        </Text>
      );
    }
    return (
      <Text style={adminStyles.emptyText}>
        {searchTerm.trim().length > 0
          ? 'No users match your search.'
          : 'No users found yet.'}
      </Text>
    );
  }, [error, loading, searchTerm]);

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
      title="Manage Users"
      subtitle="Accounts registered in the app"
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

export default ManageUsers;

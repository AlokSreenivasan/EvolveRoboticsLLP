import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  type ListRenderItem,
} from 'react-native';

import AdminScreenLayout from './AdminScreenLayout';
import { VERTICAL_LIST_PERF } from '../../constants/listPerformance';
import { colors } from '../../constants/theme';
import { adminStyles } from './adminStyles';

type AdminListLayoutProps<T> = {
  title: string;
  subtitle?: string;
  data: T[];
  loading: boolean;
  reorderingId: string | null;
  keyExtractor: (item: T) => string;
  renderItem: ListRenderItem<T>;
  listHeader: React.ReactElement | null;
  emptyMessage: string;
};

function AdminListLayout<T>({
  title,
  subtitle,
  data,
  loading,
  reorderingId,
  keyExtractor,
  renderItem,
  listHeader,
  emptyMessage,
}: AdminListLayoutProps<T>) {
  const listEmpty = useCallback(() => {
    if (loading) {
      return (
        <ActivityIndicator color={colors.primary} style={adminStyles.loader} />
      );
    }
    if (data.length === 0) {
      return <Text style={adminStyles.emptyText}>{emptyMessage}</Text>;
    }
    return null;
  }, [data.length, emptyMessage, loading]);

  return (
    <AdminScreenLayout title={title} subtitle={subtitle} scrollable={false}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={adminStyles.scrollContent}
        extraData={reorderingId}
        {...VERTICAL_LIST_PERF}
      />
    </AdminScreenLayout>
  );
}

export default AdminListLayout;

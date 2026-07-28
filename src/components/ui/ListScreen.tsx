import React, { useCallback } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  type ListRenderItem,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { VERTICAL_LIST_PERF } from '../../constants/listPerformance';
import { colors, spacing } from '../../constants/theme';
import ScreenHeader from './ScreenHeader';
import ScreenStateCard from './ScreenStateCard';

type ListScreenProps<T> = {
  title: string;
  subtitle?: string;
  data: T[];
  loading?: boolean;
  error?: boolean;
  errorTitle?: string;
  errorMessage?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  EmptyIcon?: LucideIcon;
  ErrorIcon?: LucideIcon;
  keyExtractor: (item: T) => string;
  renderItem: ListRenderItem<T>;
  showBack?: boolean;
  onBackPress?: () => void;
  rightSlot?: React.ReactNode;
  listHeader?: React.ReactElement | null;
  contentContainerStyle?: StyleProp<ViewStyle>;
  extraData?: unknown;
};

/**
 * Shared learner list shell: soft header + elevated empty/error/loading states.
 */
function ListScreen<T>({
  title,
  subtitle,
  data,
  loading = false,
  error = false,
  errorTitle = 'Something went wrong',
  errorMessage = 'Go back and try again in a moment.',
  emptyTitle = 'Nothing here yet',
  emptyMessage = 'New items will appear here once they are available.',
  EmptyIcon,
  ErrorIcon,
  keyExtractor,
  renderItem,
  showBack = true,
  onBackPress,
  rightSlot,
  listHeader,
  contentContainerStyle,
  extraData,
}: ListScreenProps<T>) {
  const listEmpty = useCallback(() => {
    if (loading) {
      return <ScreenStateCard variant="loading" />;
    }
    if (error) {
      return (
        <ScreenStateCard
          variant="error"
          title={errorTitle}
          message={errorMessage}
          Icon={ErrorIcon}
        />
      );
    }
    return (
      <ScreenStateCard
        variant="empty"
        title={emptyTitle}
        message={emptyMessage}
        Icon={EmptyIcon}
      />
    );
  }, [
    EmptyIcon,
    ErrorIcon,
    emptyMessage,
    emptyTitle,
    error,
    errorMessage,
    errorTitle,
    loading,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        onBackPress={onBackPress}
        rightSlot={rightSlot}
      />
      <FlatList
        data={loading || error ? [] : data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={[styles.listContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        extraData={extraData}
        {...VERTICAL_LIST_PERF}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 28,
    flexGrow: 1,
  },
});

export default ListScreen;

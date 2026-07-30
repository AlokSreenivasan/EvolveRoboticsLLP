import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { NESTED_LIST_PERF } from '../../constants/listPerformance';
import { useImportantUpdates } from '../../presentation/hooks/useImportantUpdates';
import type { ImportantUpdateNotice } from '../../store/content/types/importantUpdates.types';
import type { LoginScreenNavigationProp } from '../../types/navigation';
import HomeFeedSection from './HomeFeedSection';
import ImportantUpdatesCard from './ImportantUpdatesCard';

const HOME_PREVIEW_LIMIT = 3;

function ImportantUpdatesSection() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { section, displayNotices, loading, error } = useImportantUpdates();
  const previewNotices = useMemo(
    () => displayNotices.slice(0, HOME_PREVIEW_LIMIT),
    [displayNotices],
  );
  const isEmpty = !loading && !error && displayNotices.length === 0;
  const hasNotices = !loading && !error && displayNotices.length > 0;

  const openList = useCallback(() => {
    navigation.navigate('ImportantUpdatesList');
  }, [navigation]);

  const renderNotice = useCallback(
    ({ item }: { item: ImportantUpdateNotice }) => (
      <ImportantUpdatesCard notice={item} onPress={openList} />
    ),
    [openList],
  );

  const keyExtractor = useCallback(
    (item: ImportantUpdateNotice) => item.id,
    [],
  );

  return (
    <HomeFeedSection
      title={section.sectionTitle}
      actionLabel={
        hasNotices ? section.actionLabel?.trim() || 'View all' : undefined
      }
      onActionPress={hasNotices ? openList : undefined}
      subtitle={section.sectionSubtitle?.trim() || undefined}
      loading={loading}
      errorMessage={
        error
          ? 'Could not load updates. Pull down to try again.'
          : null
      }
      emptyTitle={isEmpty ? 'No updates right now' : undefined}
      emptyMessage={
        isEmpty
          ? 'When admins post announcements, they’ll show up here instantly.'
          : undefined
      }>
      {hasNotices ? (
        <FlatList
          data={previewNotices}
          keyExtractor={keyExtractor}
          renderItem={renderNotice}
          ItemSeparatorComponent={ListSeparator}
          {...NESTED_LIST_PERF}
        />
      ) : null}
    </HomeFeedSection>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  separator: {
    height: 14,
  },
});

export default ImportantUpdatesSection;

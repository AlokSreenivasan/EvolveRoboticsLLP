import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { NESTED_LIST_PERF } from '../../constants/listPerformance';
import { useImportantUpdates } from '../../presentation/hooks/useImportantUpdates';
import type { ImportantUpdateNotice } from '../../store/content/types/importantUpdates.types';
import HomeFeedSection from './HomeFeedSection';
import ImportantUpdatesCard from './ImportantUpdatesCard';

function ImportantUpdatesSection() {
  const { section, displayNotices, loading, error } = useImportantUpdates();
  const isEmpty = !loading && !error && displayNotices.length === 0;

  const renderNotice = useCallback(
    ({ item }: { item: ImportantUpdateNotice }) => (
      <ImportantUpdatesCard notice={item} />
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: ImportantUpdateNotice) => item.id,
    [],
  );

  return (
    <HomeFeedSection
      title={section.sectionTitle}
      actionLabel={section.actionLabel || undefined}
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
      {!loading && !error && displayNotices.length > 0 ? (
        <FlatList
          data={displayNotices}
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

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useImportantUpdates } from '../../presentation/hooks/useImportantUpdates';
import HomeFeedSection from './HomeFeedSection';
import ImportantUpdatesCard from './ImportantUpdatesCard';

function ImportantUpdatesSection() {
  const { section, displayNotices, loading, error } = useImportantUpdates();
  const isEmpty = !loading && !error && displayNotices.length === 0;

  return (
    <HomeFeedSection
      title={section.sectionTitle}
      actionLabel={section.actionLabel || undefined}
      subtitle={section.sectionSubtitle?.trim() || undefined}
      loading={loading}
      errorMessage={
        error
          ? 'Could not load updates. Pull to refresh the home screen.'
          : null
      }
      emptyTitle={isEmpty ? 'No updates right now' : undefined}
      emptyMessage={
        isEmpty
          ? 'When admins post announcements, they’ll show up here instantly.'
          : undefined
      }>
      {!loading && !error && displayNotices.length > 0 ? (
        <View style={styles.list}>
          {displayNotices.map(notice => (
            <ImportantUpdatesCard key={notice.id} notice={notice} />
          ))}
        </View>
      ) : null}
    </HomeFeedSection>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
});

export default ImportantUpdatesSection;

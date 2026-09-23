import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { FileText } from 'lucide-react-native';

import ResourceCategoryBar, {
  ALL_RESOURCE_NOTES,
} from '../../../components/Resources/ResourceCategoryBar';
import ResourceNoteCard from '../../../components/Resources/ResourceNoteCard';
import ListScreen from '../../../components/ui/ListScreen';
import type { ResourceNote } from '../../../store/content/types/resources.types';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { useResources } from '../../hooks/useResources';

function ResourcesScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { section, notes, loading, error, loadMore, loadingMore, hasMore } =
    useResources();
  const [selectedCategoryId, setSelectedCategoryId] =
    useState(ALL_RESOURCE_NOTES);

  const noteCtaLabel = section.actionLabel?.trim() || undefined;
  const showingAll = selectedCategoryId === ALL_RESOURCE_NOTES;

  useEffect(() => {
    if (showingAll) {
      return;
    }
    const stillListed = section.categories.some(
      category => category.id === selectedCategoryId,
    );
    if (!stillListed) {
      setSelectedCategoryId(ALL_RESOURCE_NOTES);
    }
  }, [section.categories, selectedCategoryId, showingAll]);

  const visibleNotes = useMemo(() => {
    if (showingAll) {
      return notes;
    }
    return notes.filter(note => note.categoryId === selectedCategoryId);
  }, [notes, selectedCategoryId, showingAll]);

  useEffect(() => {
    if (showingAll || loading || loadingMore || error || !hasMore) {
      return;
    }
    if (visibleNotes.length === 0) {
      loadMore();
    }
  }, [
    error,
    hasMore,
    loadMore,
    loading,
    loadingMore,
    showingAll,
    visibleNotes.length,
  ]);

  const renderNote = useCallback(
    ({ item, index }: { item: ResourceNote; index: number }) => (
      <ResourceNoteCard
        note={item}
        accentIndex={index}
        ctaLabel={noteCtaLabel}
        onPress={() =>
          navigation.navigate('ResourcePdfViewer', {
            title: item.title,
            pdfUrl: item.pdfUrl,
          })
        }
      />
    ),
    [navigation, noteCtaLabel],
  );

  const keyExtractor = useCallback((item: ResourceNote) => item.id, []);

  return (
    <ListScreen
      title="Notes"
      headerAccessory={
        <ResourceCategoryBar
          categories={section.categories}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />
      }
      data={visibleNotes}
      loading={loading}
      error={Boolean(error)}
      errorTitle="Could not load resources"
      emptyTitle={showingAll ? 'No notes yet' : 'No notes in this category'}
      emptyMessage={
        showingAll
          ? 'Study notes will appear here once your instructors publish them.'
          : 'Notes filed under this category will appear here.'
      }
      EmptyIcon={FileText}
      keyExtractor={keyExtractor}
      renderItem={renderNote}
      extraData={selectedCategoryId}
      onEndReached={loadMore}
      loadingMore={loadingMore}
    />
  );
}

export default ResourcesScreen;

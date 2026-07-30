import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { FileText } from 'lucide-react-native';

import ResourceNoteCard from '../../../components/Resources/ResourceNoteCard';
import ListScreen from '../../../components/ui/ListScreen';
import type { ResourceNote } from '../../../store/content/types/resources.types';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { useResources } from '../../hooks/useResources';

function ResourcesScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { section, notes, loading, error } = useResources();

  const noteCtaLabel = section.actionLabel?.trim() || undefined;

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
      title={section.sectionTitle}
      subtitle={section.sectionSubtitle?.trim() || undefined}
      data={notes}
      loading={loading}
      error={Boolean(error)}
      errorTitle="Could not load resources"
      emptyTitle="No notes yet"
      emptyMessage="Study notes will appear here once your instructors publish them."
      EmptyIcon={FileText}
      keyExtractor={keyExtractor}
      renderItem={renderNote}
    />
  );
}

export default ResourcesScreen;

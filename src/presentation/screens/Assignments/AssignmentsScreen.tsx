import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ClipboardList } from 'lucide-react-native';

import PdfContentCard from '../../../components/Content/PdfContentCard';
import ListScreen from '../../../components/ui/ListScreen';
import type { Assignment } from '../../../store/content/types/assignments.types';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { useAssignments } from '../../hooks/useAssignments';

function AssignmentsScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { section, assignments, loading, error } = useAssignments();

  const renderAssignment = useCallback(
    ({ item, index }: { item: Assignment; index: number }) => (
      <PdfContentCard
        title={item.title}
        subtitle={item.subtitle}
        badgeLabel={
          item.dueDateLabel.trim() ? item.dueDateLabel.trim() : undefined
        }
        accentIndex={index}
        Icon={ClipboardList}
        onPress={() =>
          navigation.navigate('ResourcePdfViewer', {
            title: item.title,
            pdfUrl: item.pdfUrl,
          })
        }
        accessibilityLabel={`Assignment ${item.title}`}
      />
    ),
    [navigation],
  );

  const keyExtractor = useCallback((item: Assignment) => item.id, []);

  return (
    <ListScreen
      title={section.sectionTitle}
      subtitle={section.sectionSubtitle?.trim() || undefined}
      data={assignments}
      loading={loading}
      error={Boolean(error)}
      errorTitle="Could not load assignments"
      emptyTitle="No assignments yet"
      emptyMessage="New assignments will appear here once your instructors publish them."
      EmptyIcon={ClipboardList}
      keyExtractor={keyExtractor}
      renderItem={renderAssignment}
    />
  );
}

export default AssignmentsScreen;

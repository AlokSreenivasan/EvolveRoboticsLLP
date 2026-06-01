import React from 'react';
import { FileText } from 'lucide-react-native';

import PdfContentCard from '../Content/PdfContentCard';
import type { ResourceNote } from '../../store/content/types/resources.types';

type ResourceNoteCardProps = {
  note: Pick<ResourceNote, 'title' | 'subtitle'>;
  accentIndex?: number;
  onPress?: () => void;
};

function ResourceNoteCard({ note, accentIndex = 0, onPress }: ResourceNoteCardProps) {
  return (
    <PdfContentCard
      title={note.title}
      subtitle={note.subtitle}
      accentIndex={accentIndex}
      Icon={FileText}
      onPress={onPress}
      accessibilityLabel={`Resource note ${note.title}`}
    />
  );
}

export default ResourceNoteCard;

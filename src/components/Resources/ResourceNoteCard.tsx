import React from 'react';
import { FileText } from 'lucide-react-native';

import PdfContentCard from '../Content/PdfContentCard';
import type { ResourceNote } from '../../store/content/types/resources.types';

type ResourceNoteCardProps = {
  note: Pick<ResourceNote, 'title' | 'subtitle'>;
  accentIndex?: number;
  ctaLabel?: string;
  onPress?: () => void;
};

function ResourceNoteCard({
  note,
  accentIndex = 0,
  ctaLabel,
  onPress,
}: ResourceNoteCardProps) {
  return (
    <PdfContentCard
      title={note.title}
      subtitle={note.subtitle}
      accentIndex={accentIndex}
      Icon={FileText}
      ctaLabel={ctaLabel}
      onPress={onPress}
      accessibilityLabel={`Resource note ${note.title}`}
    />
  );
}

export default React.memo(ResourceNoteCard);

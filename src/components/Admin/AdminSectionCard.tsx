import React from 'react';

import AppButton from '../AppButton';
import SurfaceCard from '../ui/SurfaceCard';
import { adminStyles } from './adminStyles';

type AdminSectionCardProps = {
  saving: boolean;
  saveLabel?: string;
  onSave: () => void;
  children: React.ReactNode;
};

function AdminSectionCard({
  saving,
  saveLabel = 'Save headings',
  onSave,
  children,
}: AdminSectionCardProps) {
  return (
    <SurfaceCard elevation="elevated" style={adminStyles.sectionCard}>
      {children}
      <AppButton
        title={saving ? 'Saving…' : saveLabel}
        onPress={onSave}
        disabled={saving}
        variant="primary"
        buttonStyle={adminStyles.primaryButton}
      />
    </SurfaceCard>
  );
}

export default AdminSectionCard;

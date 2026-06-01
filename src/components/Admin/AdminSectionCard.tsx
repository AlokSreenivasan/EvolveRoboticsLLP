import React from 'react';
import { View } from 'react-native';

import AppButton from '../AppButton';
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
    <View style={adminStyles.card}>
      {children}
      <AppButton
        title={saving ? 'Saving…' : saveLabel}
        onPress={onSave}
        disabled={saving}
        buttonStyle={adminStyles.primaryButton}
        textStyle={adminStyles.primaryButtonText}
      />
    </View>
  );
}

export default AdminSectionCard;

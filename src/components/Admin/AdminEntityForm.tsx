import React from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';

import AppButton from '../AppButton';
import { adminStyles } from './adminStyles';

type AdminEntityFormProps = {
  visible: boolean;
  title: string;
  saveLabel: string;
  savingLabel?: string;
  saving: boolean;
  /** Prefer over appAlert while this Modal is open (nested Modals break touches on iOS). */
  error?: string | null;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
};

function AdminEntityForm({
  visible,
  title,
  saveLabel,
  savingLabel = 'Saving…',
  saving,
  error,
  onClose,
  onSave,
  children,
}: AdminEntityFormProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={adminStyles.modalContainer}>
        <Text style={adminStyles.modalTitle}>{title}</Text>
        {error ? <Text style={adminStyles.formError}>{error}</Text> : null}
        <ScrollView contentContainerStyle={adminStyles.modalScroll}>
          {children}
        </ScrollView>
        <View style={adminStyles.modalActions}>
          <AppButton
            title="Cancel"
            onPress={onClose}
            buttonStyle={adminStyles.secondaryButton}
            textStyle={adminStyles.secondaryButtonText}
          />
          <AppButton
            title={saving ? savingLabel : saveLabel}
            onPress={onSave}
            disabled={saving}
            buttonStyle={adminStyles.primaryButton}
            textStyle={adminStyles.primaryButtonText}
          />
        </View>
      </View>
    </Modal>
  );
}

export default AdminEntityForm;

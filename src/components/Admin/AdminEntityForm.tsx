import React, { useEffect } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '../AppButton';
import { adminStyles } from './adminStyles';

type AdminEntityFormProps = {
  visible: boolean;
  title: string;
  saveLabel: string;
  savingLabel?: string;
  saving: boolean;
  /** Prefer over appAlert while this editor is open (nested Modals break touches on iOS). */
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
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onClose();
        return true;
      },
    );
    return () => subscription.remove();
  }, [onClose, visible]);

  if (!visible) {
    return null;
  }

  return (
    <View style={adminStyles.modalOverlay} accessibilityViewIsModal>
      <KeyboardAvoidingView
        style={adminStyles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <View
          style={[
            adminStyles.modalContainer,
            {
              paddingTop: insets.top,
              paddingLeft: insets.left,
              paddingRight: insets.right,
            },
          ]}>
          <View style={adminStyles.modalHeader}>
            <Text style={adminStyles.modalTitle}>{title}</Text>
            {error ? <Text style={adminStyles.formError}>{error}</Text> : null}
          </View>
          <ScrollView
            style={adminStyles.modalScrollView}
            contentContainerStyle={adminStyles.modalScroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            {children}
          </ScrollView>
          <View
            style={[
              adminStyles.modalActions,
              { paddingBottom: Math.max(16, insets.bottom) },
            ]}>
            <AppButton
              title="Cancel"
              onPress={onClose}
              variant="secondary"
              buttonStyle={adminStyles.secondaryButton}
            />
            <AppButton
              title={saving ? savingLabel : saveLabel}
              onPress={onSave}
              disabled={saving}
              variant="primary"
              buttonStyle={adminStyles.primaryButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

export default AdminEntityForm;

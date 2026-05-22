import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AppButton from '../AppButton.tsx';

type DeleteAccountConfirmModalProps = {
  visible: boolean;
  requiresPassword: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: (currentPassword?: string) => void;
};

function DeleteAccountConfirmModal({
  visible,
  requiresPassword,
  loading,
  onCancel,
  onConfirm,
}: DeleteAccountConfirmModalProps) {
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!visible) {
      setPassword('');
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm(requiresPassword ? password : undefined);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={loading ? undefined : onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Delete Account?</Text>
          <Text style={styles.warning}>
            This action is permanent and cannot be undone. Your profile data,
            authentication access, and all user-related information will be
            removed from our systems.
          </Text>

          {requiresPassword ? (
            <>
              <Text style={styles.passwordLabel}>
                Enter your password to confirm
              </Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="Current password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={loading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <AppButton
              title={loading ? 'Deleting...' : 'Confirm Delete'}
              onPress={handleConfirm}
              buttonStyle={styles.deleteButton}
              textStyle={styles.deleteButtonText}
              disabled={loading}
            />
          </View>

          {loading ? (
            <ActivityIndicator color="#c62828" style={styles.loader} />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#c62828',
    marginBottom: 12,
  },
  warning: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 16,
  },
  passwordLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#ef9a9a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  actions: {
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#c62828',
    paddingVertical: 14,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loader: {
    marginTop: 12,
    alignSelf: 'center',
  },
});

export default DeleteAccountConfirmModal;

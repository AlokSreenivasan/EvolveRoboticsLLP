import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Eye, EyeOff, Trash2 } from 'lucide-react-native';

import {
  colors,
  inputFieldStyle,
  typography,
} from '../../constants/theme';
import {
  QuizModalAction,
  QuizModalActionStack,
  QuizModalHero,
  QuizModalSecondaryAction,
  QuizModalShell,
  styles as modalStyles,
} from '../QuizCompetitions/quizModalShared';

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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setPassword('');
      setIsPasswordVisible(false);
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm(requiresPassword ? password : undefined);
  };

  return (
    <QuizModalShell visible={visible} onClose={loading ? () => {} : onCancel}>
      <QuizModalHero
        variant="error"
        title="Delete Account?"
        subtitle="This action is permanent and cannot be undone."
        Icon={Trash2}
        iconColor={colors.danger}
      />

      <View style={modalStyles.body}>
        <Text style={styles.warning}>
          Your profile data, authentication access, and all user-related
          information will be removed from our systems.
        </Text>

        {requiresPassword ? (
          <>
            <Text style={styles.passwordLabel}>
              Enter your password to confirm
            </Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Current password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(v => !v)}
                style={styles.passwordToggle}
                disabled={loading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel={
                  isPasswordVisible ? 'Hide password' : 'Show password'
                }>
                {isPasswordVisible ? (
                  <EyeOff size={20} color={colors.danger} />
                ) : (
                  <Eye size={20} color={colors.danger} />
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        <QuizModalActionStack>
          <QuizModalSecondaryAction
            label="Cancel"
            onPress={onCancel}
            disabled={loading}
          />
          <QuizModalAction
            label={loading ? 'Deleting...' : 'Confirm Delete'}
            onPress={handleConfirm}
            tone="danger"
            disabled={loading}
          />
        </QuizModalActionStack>

        {loading ? (
          <ActivityIndicator
            color={colors.danger}
            style={styles.loader}
          />
        ) : null}
      </View>
    </QuizModalShell>
  );
}

const styles = StyleSheet.create({
  warning: {
    ...typography.bodySecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  passwordLabel: {
    ...typography.label,
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    ...inputFieldStyle,
    marginBottom: 16,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  passwordToggle: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginTop: 12,
    alignSelf: 'center',
  },
});

export default DeleteAccountConfirmModal;

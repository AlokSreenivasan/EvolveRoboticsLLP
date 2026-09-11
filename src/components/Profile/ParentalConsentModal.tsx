import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import AppButton from '../AppButton.tsx';
import {
  createParentalGateChallenge,
  parentalGatePrompt,
  verifyParentalGateAnswer,
  type ParentalGateChallenge,
} from '../../domain/Profile/validation/parentalGate';
import { colors, inputFieldStyle, spacing, typography } from '../../constants/theme';

type ParentalConsentModalProps = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ParentalConsentModal({
  visible,
  onConfirm,
  onCancel,
}: ParentalConsentModalProps) {
  const [challenge, setChallenge] = useState<ParentalGateChallenge>(() =>
    createParentalGateChallenge(),
  );
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setChallenge(createParentalGateChallenge());
    setAnswer('');
    setError(null);
  }, [visible]);

  const handleConfirm = () => {
    if (!verifyParentalGateAnswer(challenge, answer)) {
      setError('That answer is not correct. A parent or guardian should try again.');
      setChallenge(createParentalGateChallenge());
      setAnswer('');
      return;
    }
    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <Text style={styles.title}>Parent or guardian step</Text>
          <Text style={styles.body}>
            A parent or guardian must complete this short check so this
            under-13 student can continue. The student is not blocked from
            Evolve.
          </Text>
          <Text style={styles.prompt}>What is {parentalGatePrompt(challenge)}?</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={answer}
            onChangeText={value => {
              setAnswer(value.replace(/[^\d]/g, ''));
              setError(null);
            }}
            keyboardType="number-pad"
            maxLength={3}
            placeholder="Answer"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Parental gate answer"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.actions}>
            <AppButton
              title="Cancel"
              onPress={onCancel}
              variant="secondary"
              buttonStyle={styles.actionButton}
            />
            <AppButton
              title="Confirm"
              onPress={handleConfirm}
              variant="primary"
              buttonStyle={styles.actionButton}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    backgroundColor: colors.overlayScrim,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadiusLg,
    padding: 20,
  },
  title: {
    ...typography.cardTitle,
    color: colors.primary,
  },
  body: {
    ...typography.bodySecondary,
    marginTop: 10,
  },
  prompt: {
    ...typography.body,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    ...inputFieldStyle,
    minHeight: 48,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
  },
});

export default ParentalConsentModal;

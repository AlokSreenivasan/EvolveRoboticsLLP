import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

import AppButton from '../../../components/AppButton.tsx';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import { appAlert, appAlertCopy } from '../../../utils/alert/appAlert';
import {
  getCurrentUserEmail,
  sendEmailVerificationEmail,
  signOut,
} from '../../../services/firebase/authService';
import { useAuth } from '../../context/AuthContext';
import { useAuthFlow } from '../../context/AuthFlowContext';
import {
  colors,
  spacing,
  typography,
} from '../../../constants/theme';

function VerifyEmailScreen() {
  const { completeEmailVerification } = useAuth();
  const { notifyAuthSuccess } = useAuthFlow();
  const email = getCurrentUserEmail();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerified = async () => {
    if (checking || resending) {
      return;
    }

    setChecking(true);
    try {
      const verified = await completeEmailVerification();
      if (verified) {
        notifyAuthSuccess();
        return;
      }
      appAlert(
        appAlertCopy.auth.verifyEmailStillPendingTitle,
        appAlertCopy.auth.verifyEmailStillPendingMessage,
      );
    } catch (error) {
      appAlert(
        appAlertCopy.auth.verifyEmailStillPendingTitle,
        error instanceof Error
          ? error.message
          : appAlertCopy.auth.verifyEmailStillPendingMessage,
      );
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    if (checking || resending) {
      return;
    }

    setResending(true);
    try {
      await sendEmailVerificationEmail();
      appAlert(
        appAlertCopy.auth.verifyEmailResentTitle,
        appAlertCopy.auth.verifyEmailResentMessage,
      );
    } catch (error) {
      appAlert(
        appAlertCopy.auth.verifyEmailResendFailedTitle,
        error instanceof Error
          ? error.message
          : appAlertCopy.auth.verifyEmailResentMessage,
      );
    } finally {
      setResending(false);
    }
  };

  const handleBackToLogin = async () => {
    await signOut();
  };

  const isBusy = checking || resending;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Verify Email"
        subtitle="Confirm the address you signed up with"
        onBackPress={handleBackToLogin}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <SurfaceCard elevation="default" style={styles.card}>
          <Text style={styles.heading}>Check your inbox</Text>
          <Text style={styles.subText}>
            {appAlertCopy.auth.verifyEmailInboxMessage}
          </Text>
          {email ? <Text style={styles.email}>{email}</Text> : null}

          <AppButton
            title="I have verified"
            onPress={handleVerified}
            variant="primary"
            loading={checking}
            disabled={isBusy}
            buttonStyle={styles.button}
          />
          <AppButton
            title="Resend email"
            onPress={handleResend}
            variant="secondary"
            loading={resending}
            disabled={isBusy}
            buttonStyle={styles.secondaryButton}
          />
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.screenHorizontal,
    paddingTop: 20,
    paddingBottom: 32,
  },
  card: {
    padding: 20,
  },
  heading: {
    ...typography.screenTitle,
    fontSize: 22,
    marginBottom: 10,
  },
  subText: {
    ...typography.screenSubtitle,
    marginBottom: 12,
  },
  email: {
    ...typography.bodySecondary,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 20,
  },
  button: {
    marginTop: 8,
  },
  secondaryButton: {
    marginTop: 12,
  },
});

export default VerifyEmailScreen;

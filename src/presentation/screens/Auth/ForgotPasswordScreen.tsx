import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useNavigation } from '@react-navigation/native';
import AppButton from '../../../components/AppButton.tsx';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import { isValidEmail } from '../../../domain/Auth/validation/isValidEmail.ts';
import { sendPasswordResetEmail } from '../../../services/firebase/authService';
import { appAlert, appAlertCopy } from '../../../utils/alert/appAlert';
import {
  colors,
  inputFieldStyle,
  spacing,
  typography,
} from '../../../constants/theme';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ForgotPassword'
>;

function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError && isValidEmail(text)) {
      setEmailError('');
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(email);
      appAlert(
        appAlertCopy.auth.resetEmailSentTitle,
        appAlertCopy.auth.resetEmailSentMessage,
      );
    } catch (error) {
      appAlert(
        appAlertCopy.auth.resetFailedTitle,
        error instanceof Error
          ? error.message
          : appAlertCopy.auth.resetFailedMessage,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Forgot Password"
        subtitle="We'll send you a reset link"
        onBackPress={() => navigation.navigate('Login')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <SurfaceCard elevation="default" style={styles.card}>
          <Text style={styles.heading}>Reset Your Password</Text>
          <Text style={styles.subText}>
            Enter the email address associated with your account, and we'll send
            you a link to reset your password.
          </Text>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholderTextColor={colors.textMuted}
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="your.email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={handleEmailChange}
            editable={!loading}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <AppButton
            title="Send Reset Link"
            onPress={handleResetPassword}
            variant="primary"
            loading={loading}
            disabled={loading}
            buttonStyle={styles.button}
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
    marginBottom: 24,
  },
  label: {
    ...typography.label,
    color: colors.primary,
    marginBottom: 8,
  },
  input: {
    ...inputFieldStyle,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default ForgotPasswordScreen;

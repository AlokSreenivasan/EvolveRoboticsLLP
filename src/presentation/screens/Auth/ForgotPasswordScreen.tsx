import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import BackButton from '../../../components/BackButton';
import { isValidEmail } from '../../../domain/Auth/validation/isValidEmail.ts';
import { sendPasswordResetEmail } from '../../../services/firebase/authService';
import { appAlert, appAlertCopy } from '../../../utils/alert/appAlert';

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
      <ScrollView style={styles.container}>
        <View style={styles.firstBox}>
          <BackButton onPress={() => navigation.navigate('Login')} />
          <Text style={styles.title}>Forgot Password</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.heading}>Reset Your Password</Text>
          <Text style={styles.subText}>
            Enter the email address associated with your account, and we'll send
            you a link to reset your password.
          </Text>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholderTextColor="light black"
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
            title={loading ? 'Sending...' : 'Send Reset Link'}
            onPress={handleResetPassword}
            buttonStyle={styles.button}
            textStyle={styles.buttonText}
            disabled={loading}
          />
          {loading ? (
            <ActivityIndicator color="#a42a8b" style={styles.loader} />
          ) : null}
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  firstBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    height: 100,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    paddingLeft: '25%',
    color: '#a42a8b',
  },
  content: { marginTop: 30 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subText: { fontSize: 14, color: '#555', marginBottom: 20, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#a42a8b' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 4,
  },
  inputError: {
    borderColor: '#e57373',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 16,
  },
  loader: {
    marginTop: 12,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#a42a8b',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ForgotPasswordScreen;

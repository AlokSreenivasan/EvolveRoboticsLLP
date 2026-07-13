import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff } from 'lucide-react-native';
import { signInWithEmailPassword } from '../../../services/firebase/authService';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import AppButton from '../../../components/AppButton.tsx';
import { isValidEmail } from '../../../domain/Auth/validation/isValidEmail.ts';
import { useAuthFlow } from '../../context/AuthFlowContext';
import { appAlert, appAlertCopy } from '../../../utils/alert/appAlert';
import {
  isGoogleSignInCancelled,
  signInWithGoogle,
} from '../../../services/auth/googleSignInService';

function getAuthErrorMessage(error: { code?: string; message?: string }) {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return error.message ?? 'Login failed. Please try again.';
  }
}

function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { notifyAuthSuccess } = useAuthFlow();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleSignInMountedRef = useRef(true);

  useEffect(() => {
    googleSignInMountedRef.current = true;
    setGoogleLoading(false);

    return () => {
      googleSignInMountedRef.current = false;
    };
  }, []);

  const handleSignIn = async () => {
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');

    if (password.trim() === '') {
      appAlert(
        appAlertCopy.auth.passwordEmptyTitle,
        appAlertCopy.auth.passwordEmpty,
      );
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailPassword(email, password);
      notifyAuthSuccess();
    } catch (error) {
      appAlert(appAlertCopy.auth.signInFailedTitle, getAuthErrorMessage(error as { code?: string; message?: string }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleLoading) {
      return;
    }

    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      if (!googleSignInMountedRef.current) {
        return;
      }
      notifyAuthSuccess();
    } catch (error) {
      if (!googleSignInMountedRef.current) {
        return;
      }
      if (!isGoogleSignInCancelled(error)) {
        appAlert(
          appAlertCopy.auth.googleSignInFailedTitle,
          (error as Error)?.message ?? appAlertCopy.auth.googleSignInFailedMessage,
        );
      }
    } finally {
      if (googleSignInMountedRef.current) {
        setGoogleLoading(false);
      }
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError && isValidEmail(text)) {
      setEmailError('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.logoView}>
            <Image
              source={require('../../../assets/LOGO__.png')}
              style={styles.logo}
            />
          </View>
          <View style={styles.card}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subText}>
              Sign in to continue your journey with Evolve Robotics.
            </Text>

            <Text style={styles.label}>Email Address</Text>

            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="light black"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, emailError ? styles.inputError : null]}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}


            <Text style={styles.label}>Password</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                placeholderTextColor="light black"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                textContentType="password"
                autoCapitalize="none"
                style={styles.passwordInput}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(v => !v)}
                style={styles.passwordToggle}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
              >
                {isPasswordVisible ? (
                  <EyeOff size={20} color="#a42a8b" />
                ) : (
                  <Eye size={20} color="#a42a8b" />
                )}
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <AppButton
              title={loading ? 'Signing in...' : 'Login to Account'}
              onPress={handleSignIn}
              buttonStyle={styles.loginButton}
              textStyle={styles.loginText}
              disabled={loading || googleLoading}
            />
            {loading ? (
              <ActivityIndicator color="#a42a8b" style={styles.loader} />
            ) : null}

            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={loading || googleLoading}
              style={[
                styles.googleButton,
                loading || googleLoading ? styles.googleButtonDisabled : null,
              ]}
            >
              <Text style={styles.googleButtonText}>
                {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginTop: 40,
    backgroundColor: '#fff',
  },
  logoView: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    height: 60,
    width: 60,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    height: '100%',
    paddingVertical: 20,
    top: '7%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    alignSelf: 'center',
    color: '#a42a8b',
    marginBottom: 22,
    paddingTop: 15,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#000',
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    color: '#555',
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
    color: '#a42a8b',
  },
  forgotPasswordText: {
    color: '#9C27B0', // Purple color
    textAlign: 'right',
    marginBottom: 32,
    fontSize: 14,
  },

  input: {
    borderWidth: 1,
    borderColor: '#eecdf4',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#eecdf4',
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  passwordToggle: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: '#a42a8b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  loader: {
    marginTop: 12,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#eecdf4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupLink: {
    fontSize: 14,
    color: '#9C27B0',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  inputError: {
    // borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 10,
  },

});

export default LoginScreen;

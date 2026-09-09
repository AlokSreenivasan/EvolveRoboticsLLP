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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff } from 'lucide-react-native';
import { signInWithEmailPassword } from '../../../services/firebase/authService';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import AppButton from '../../../components/AppButton.tsx';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import { isValidEmail } from '../../../domain/Auth/validation/isValidEmail.ts';
import { useAuthFlow } from '../../context/AuthFlowContext';
import { useAuth } from '../../context/AuthContext';
import { appAlert, appAlertCopy } from '../../../utils/alert/appAlert';
import {
  getGoogleSignInErrorMessage,
  isGoogleSignInCancelled,
  signInWithGoogle,
} from '../../../services/auth/googleSignInService';
import {
  colors,
  inputFieldStyle,
  spacing,
  typography,
} from '../../../constants/theme';

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
  const { establishSessionProfile } = useAuth();
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
      const { needsEmailVerification } = await signInWithEmailPassword(
        email,
        password,
      );
      if (!needsEmailVerification) {
        notifyAuthSuccess();
      }
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
      const profile = await signInWithGoogle();
      // Seed session before nav/hydration races so Profile completion is populated.
      establishSessionProfile(profile);
      // Always clear the intro auth gate — Auth may already be unmounted while
      // splash covers profile hydration after Firebase creates the session.
      notifyAuthSuccess();
    } catch (error) {
      if (!googleSignInMountedRef.current) {
        return;
      }
      if (!isGoogleSignInCancelled(error)) {
        appAlert(
          appAlertCopy.auth.googleSignInFailedTitle,
          getGoogleSignInErrorMessage(error),
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

  const isBusy = loading || googleLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.logoView}>
            <Image
              source={require('../../../assets/LOGO__.webp')}
              style={styles.logo}
            />
          </View>

          <Text style={styles.brandLabel}>Sign In</Text>

          <SurfaceCard elevation="default" style={styles.card}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subText}>
              Sign in to continue your journey with Evolve Robotics.
            </Text>

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, emailError ? styles.inputError : null]}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholderTextColor={colors.textMuted}
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
                  <EyeOff size={20} color={colors.primary} />
                ) : (
                  <Eye size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPasswordButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <AppButton
              title="Login to Account"
              onPress={handleSignIn}
              variant="primary"
              loading={loading}
              disabled={isBusy}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <AppButton
              title="Continue with Google"
              onPress={handleGoogleSignIn}
              variant="secondary"
              loading={googleLoading}
              disabled={isBusy}
            />

            <View style={styles.signupContainer}>
              <Text style={styles.signupPrompt}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </SurfaceCard>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  logoView: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    height: 72,
    width: 72,
  },
  brandLabel: {
    ...typography.label,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  card: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  welcomeText: {
    ...typography.screenTitle,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    ...typography.screenSubtitle,
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    ...typography.label,
    color: colors.primary,
    marginBottom: 8,
    marginTop: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    minHeight: 44,
    justifyContent: 'center',
  },
  forgotPasswordText: {
    ...typography.bodySecondary,
    color: colors.link,
    fontWeight: '600',
  },
  input: {
    ...inputFieldStyle,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    ...inputFieldStyle,
    marginBottom: 8,
    paddingVertical: 0,
  },
  passwordToggle: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.bodySecondary,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 12,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    minHeight: 44,
  },
  signupPrompt: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
  },
  signupLink: {
    ...typography.bodySecondary,
    color: colors.link,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 8,
  },
});

export default LoginScreen;

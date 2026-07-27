import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff } from 'lucide-react-native';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import AppButton from '../../../components/AppButton.tsx';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import { isValidEmail } from '../../../domain/Auth/validation/isValidEmail.ts';
import { appAlert, appAlertCopy } from '../../../utils/alert/appAlert';
import {
  CONTACT_NUMBER_MAX_LENGTH,
  formatContactNumberInput,
} from '../../../domain/Profile/validation/formatContactNumber';
import { isValidContactNumber } from '../../../domain/Profile/validation/isValidContactNumber';
import { signUpWithProfile } from '../../../services/firebase/signUpService';
import { useAuth } from '../../context/AuthContext';
import { useAuthFlow } from '../../context/AuthFlowContext';
import {
  colors,
  inputFieldStyle,
  spacing,
  typography,
} from '../../../constants/theme';

type Errors = {
  fullName?: string;
  contactNumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const SignUpScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { establishSessionProfile } = useAuth();
  const { notifyAuthSuccess } = useAuthFlow();

  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const handleFullNameChange = (text: string) => {
    const formatted = text
      .split(' ')
      .map(word =>
        word.length > 0
          ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          : '',
      )
      .join(' ');

    setFullName(formatted);
  };

  const handleContactNumberChange = (text: string) => {
    setContactNumber(formatContactNumberInput(text));
    if (errors.contactNumber) {
      setErrors(prev => ({ ...prev, contactNumber: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Errors = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!isValidContactNumber(contactNumber)) {
      newErrors.contactNumber = 'Contact number must be exactly 10 digits';
    }
    if (!email || !isValidEmail(email))
      newErrors.email = 'Valid email is required';
    if (!password || password.length < 8)
      newErrors.password = 'Minimum 8 characters';
    if (confirmPassword !== password)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const profile = await signUpWithProfile({
        fullName,
        email,
        password,
        phoneNumber: contactNumber,
      });

      establishSessionProfile(profile);
      notifyAuthSuccess();
    } catch (error) {
      appAlert(
        appAlertCopy.auth.signUpFailedTitle,
        error instanceof Error
          ? error.message
          : appAlertCopy.auth.signUpFailedMessage,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.brandLabel}>Sign Up</Text>

        <SurfaceCard elevation="default" style={styles.card}>
          <Text style={styles.heading}>Create Your Account</Text>
          <Text style={styles.subText}>
            Join Evolve Robotics and start your learning journey.
          </Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textMuted}
            value={fullName}
            onChangeText={handleFullNameChange}
          />
          {errors.fullName && <Text style={styles.error}>{errors.fullName}</Text>}

          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={[
              styles.input,
              errors.contactNumber ? styles.inputError : null,
            ]}
            placeholder="Enter 10-digit contact number"
            placeholderTextColor={colors.textMuted}
            value={contactNumber}
            onChangeText={handleContactNumberChange}
            keyboardType="number-pad"
            maxLength={CONTACT_NUMBER_MAX_LENGTH}
            inputMode="numeric"
          />
          {errors.contactNumber && (
            <Text style={styles.error}>{errors.contactNumber}</Text>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your.email@example.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Minimum 8 characters"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              autoCorrect={false}
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
          {errors.password && <Text style={styles.error}>{errors.password}</Text>}

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Re-enter password"
              placeholderTextColor={colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setIsConfirmPasswordVisible(v => !v)}
              style={styles.passwordToggle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={
                isConfirmPasswordVisible ? 'Hide password' : 'Show password'
              }
            >
              {isConfirmPasswordVisible ? (
                <EyeOff size={20} color={colors.primary} />
              ) : (
                <Eye size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.error}>{errors.confirmPassword}</Text>
          )}

          <AppButton
            title="Sign Up"
            onPress={handleSignUp}
            variant="primary"
            loading={loading}
            disabled={loading}
            buttonStyle={styles.submitButton}
          />

          <View style={styles.signupline}>
            <Text style={styles.signupPrompt}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signinLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.screenHorizontal,
    paddingBottom: 32,
    flexGrow: 1,
  },
  brandLabel: {
    ...typography.label,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginVertical: 24,
  },
  card: {
    padding: 20,
  },
  heading: {
    ...typography.screenTitle,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    ...typography.screenSubtitle,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    ...typography.label,
    color: colors.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    ...inputFieldStyle,
    fontSize: 16,
    color: colors.textPrimary,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    ...inputFieldStyle,
    paddingVertical: 0,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  passwordToggle: {
    paddingHorizontal: 12,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 6,
  },
  inputError: {
    borderColor: colors.danger,
  },
  submitButton: {
    marginTop: 20,
  },
  signupline: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
  },
  signupPrompt: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
  },
  signinLink: {
    ...typography.bodySecondary,
    color: colors.link,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;

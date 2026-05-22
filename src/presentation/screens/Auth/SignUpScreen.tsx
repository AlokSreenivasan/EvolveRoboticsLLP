import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import AppButton from '../../../components/AppButton.tsx';
import { isValidEmail } from '../../../domain/Auth/validation/isValidEmail.ts';
import {
  CONTACT_NUMBER_MAX_LENGTH,
  formatContactNumberInput,
} from '../../../domain/Profile/validation/formatContactNumber';
import { isValidContactNumber } from '../../../domain/Profile/validation/isValidContactNumber';
import { signUpWithProfile } from '../../../services/firebase/signUpService';
import { setCachedUserProfile } from '../../../services/profileCache';
import { useAuthFlow } from '../../context/AuthFlowContext';

type Errors = {
  fullName?: string;
  contactNumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const SignUpScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { notifyAuthSuccess } = useAuthFlow();

  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

      await setCachedUserProfile(profile);
      notifyAuthSuccess();
    } catch (error) {
      Alert.alert(
        'Sign Up Error',
        error instanceof Error
          ? error.message
          : 'Sign up failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <View style={styles.card}>
        <Text style={styles.heading}>Create Your Account</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
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
          placeholderTextColor="#999"
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
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Minimum 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {errors.confirmPassword && (
          <Text style={styles.error}>{errors.confirmPassword}</Text>
        )}

        <AppButton
          title={loading ? 'Creating account...' : 'Sign Up'}
          onPress={handleSignUp}
          buttonStyle={styles.button}
          textStyle={styles.buttonText}
          disabled={loading}
        />
        {loading ? (
          <ActivityIndicator color="#a42a8b" style={styles.loader} />
        ) : null}

        <View style={styles.signupline}>
          <Text>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signinLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  title: {
    fontSize: 20,
    fontWeight: '600',
    alignSelf: 'center',
    marginVertical: 46,
    color: '#a42a8b',
  },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    alignSelf: 'center',
  },
  label: { marginTop: 10, fontWeight: '500', color: '#a42a8b' },
  input: {
    borderWidth: 1,
    borderColor: '#eecdf4',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
    color: '#a42a8b',
  },
  error: { fontSize: 12, color: 'red', marginBottom: 5 },
  inputError: {
    borderColor: '#e57373',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  checkboxText: { marginLeft: 8 },
  link: { color: '#a42a8b', fontWeight: '600' },
  button: {
    backgroundColor: '#a42a8b',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: { color: '#fff', alignSelf: 'center', fontWeight: 'bold' },
  footerText: {
    alignSelf: 'center',
    marginTop: 15,
  },
  signupline: {
    flexDirection: 'row',
    marginVertical: 15,
    justifyContent: 'center',
  },
  signinLink: {
    fontSize: 14,
    color: '#9C27B0',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loader: {
    marginTop: 12,
    alignSelf: 'center',
  },
});

export default SignUpScreen;

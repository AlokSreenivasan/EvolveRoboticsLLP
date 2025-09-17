import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import AppButton from '../../../components/AppButton.tsx';
import { isValidEmail } from '../../../domain/Auth/validation/isValidEmail.ts';

function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleSignIn = () => {
    // Validate email
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');

    // Proceed with login (API, etc.)
    if (password.trim() === '') {
      Alert.alert('Error', 'Password cannot be empty');
      return;
    }

    navigation.navigate('Home');
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
                secureTextEntry
                textContentType="password"
                autoCapitalize="none"
                style={styles.passwordInput}
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <AppButton
              title="Login to Account"
              onPress={handleSignIn}
              buttonStyle={styles.loginButton}
              textStyle={styles.loginText}
            />

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
  loginButton: {
    backgroundColor: '#a42a8b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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

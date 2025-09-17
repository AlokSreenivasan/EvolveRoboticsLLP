import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useNavigation } from '@react-navigation/native';
import AppButton from '../../../components/AppButton.tsx';
import { isValidEmail } from '../../../domain/Auth/validation/isValidEmail.ts';
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const navigation = useNavigation<NavigationProp>();


  const handleResetPassword = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    if (!isValidEmail(email)) {   // ✅ Reused function
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    // Call API for sending reset link here
    Alert.alert('Success', 'Password reset link sent to your email.');
  };



  return (
      <ScrollView style={styles.container}>
        <View style={styles.firstBox}>
          {/* Back button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
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
            style={styles.input}
            placeholder="your.email@example.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <AppButton
            title="Send Reset Link"
            onPress={handleResetPassword}
            buttonStyle={styles.button}
            textStyle={styles.buttonText}
          />
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
  backButton: {

  },
  backText: { fontSize: 22, fontWeight: 'bold' },
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
    marginBottom: 20,
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

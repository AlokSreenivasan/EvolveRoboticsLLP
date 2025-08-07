import React from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';

function SignUpScreen() {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <View style={styles.card}>
        <Text style={styles.heading}>Create Your Account</Text>

        <Text style={styles.label}>Full name:</Text>
        <TextInput
          placeholder="Enter full name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />
        {/*{errors.fullName && <Text style={styles.error}>{errors.fullName</Text>}*/}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="your.email@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        {/*{errors.email && <Text style={styles.error}>{errors.email}</Text>}*/}

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Minimum 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {/*{errors.password && <Text style={styles.error}>{errors.password}</Text>}*/}

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {/*{errors.confirmPassword && (*/}
        {/*  <Text style={styles.error}>{errors.confirmPassword}</Text>*/}
        {/*)}*/}

        <TouchableOpacity
          style={styles.button}
          // onPress={handleSignUp}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account? <Text style={styles.link}>Sign In</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    alignSelf: 'center',
    padding: 30,
    marginVertical: 16,
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
  label: {
    marginTop: 36,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
  },
  error: {
    fontSize: 12,
    color: 'red',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#a42a8b',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  footerText: {
    alignSelf: 'center',
    marginTop: 15,
  },
  link: {
    color: '#a42a8b',
    fontWeight: '600',
  },
});
export default SignUpScreen;

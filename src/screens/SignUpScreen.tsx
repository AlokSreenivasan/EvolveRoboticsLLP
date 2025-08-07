import React from 'react';
import {Text, View, StyleSheet, TextInput} from 'react-native';

function SignUpScreen() {
  const [email, setEmail] = React.useState('');
  return (
    <View style={styles.container}>
      <Text>Sign Up</Text>

      <TextInput
        placeholder="Enter your email"
        placeholderTextColor="#a84fa1"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
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
});
export default SignUpScreen;

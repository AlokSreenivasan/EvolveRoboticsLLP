import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

function IntroScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/LOGO__.png')}
        style={styles.logo}
      />

      <Text style={styles.title}>Welcome to Evolve Robotics</Text>
      <Text style={styles.subtitle}>
        Innovating the future of automation.
      </Text>
      <Text>About</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    height: 80,
    width: 80,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#a42a8b',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
  },
});

export default IntroScreen;

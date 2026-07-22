import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text>About</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default AboutScreen;

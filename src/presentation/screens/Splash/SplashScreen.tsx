import React from 'react';
import { ActivityIndicator, Image, SafeAreaView, StyleSheet } from 'react-native';

const SplashScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* App Logo */}
      <Image
        source={require('../../../assets/LOGO__.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      {/* Loading Indicator */}
      <ActivityIndicator size="large" color="#a42a8b" style={styles.loader} />
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // you can use your brand color
    alignItems: 'center',
    justifyContent: 'center',

  },
  logo: {
    width: 150,
    height: 150,
  },
  loader: {
    marginTop: 20,
  },
});

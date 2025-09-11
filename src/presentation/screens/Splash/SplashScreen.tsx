import React from 'react';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      {/* App Logo */}
      <Image
        source={require('../../../assets/LOGO__.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      {/* Loading Indicator */}
      <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
    </View>
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
});

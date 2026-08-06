import React from 'react';
import { Image, SafeAreaView, StyleSheet } from 'react-native';

import { colors } from '../../../constants/theme';

const SplashScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../../assets/LOGO__.webp')}
        style={styles.logo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 140,
  },
});

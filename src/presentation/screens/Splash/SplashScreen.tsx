import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { colors } from '../../../constants/theme';
import ScreenSafeArea from '../../../components/ui/ScreenSafeArea';

const SplashScreen = () => {
  return (
    <ScreenSafeArea style={styles.container}>
      <Image
        source={require('../../../assets/LOGO__.webp')}
        style={styles.logo}
        resizeMode="contain"
      />
    </ScreenSafeArea>
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

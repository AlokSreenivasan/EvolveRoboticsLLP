import React from 'react';
import { ActivityIndicator, Image, SafeAreaView, StyleSheet, View } from 'react-native';

import { cardShadowLight, colors, spacing } from '../../../constants/theme';

const SplashScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoGlow} />
      <Image
        source={require('../../../assets/LOGO__.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primaryMuted,
    opacity: 0.45,
    ...cardShadowLight,
  },
  logo: {
    width: 140,
    height: 140,
  },
  loader: {
    marginTop: spacing.sectionGap,
  },
});

import React, { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { colors } from '../../../constants/theme';
import type { LoginScreenNavigationProp } from '../../../types/navigation';

/** @deprecated Use To Do screen with the Learn tab instead. */
function ContinueLearningListScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  useFocusEffect(
    useCallback(() => {
      navigation.replace('ToDo', { tab: 'learn' });
    }, [navigation]),
  );

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});

export default ContinueLearningListScreen;

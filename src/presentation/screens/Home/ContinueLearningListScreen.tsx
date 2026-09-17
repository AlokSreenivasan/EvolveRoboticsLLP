import React, { useCallback } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { colors } from '../../../constants/theme';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import ScreenSafeArea from '../../../components/ui/ScreenSafeArea';

/** @deprecated Use To Do screen with the Learn tab instead. */
function ContinueLearningListScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  useFocusEffect(
    useCallback(() => {
      navigation.replace('ToDo', { tab: 'learn' });
    }, [navigation]),
  );

  return (
    <ScreenSafeArea style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
    </ScreenSafeArea>
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

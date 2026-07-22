import React, { useCallback } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { colors } from '../../../constants/theme';
import type { LoginScreenNavigationProp } from '../../../types/navigation';

/** @deprecated Use To Do screen with the Project tab instead. */
function ProjectsScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  useFocusEffect(
    useCallback(() => {
      navigation.replace('ToDo', { tab: 'project' });
    }, [navigation]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
    </SafeAreaView>
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

export default ProjectsScreen;

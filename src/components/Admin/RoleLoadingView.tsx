import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

type RoleLoadingViewProps = {
  message?: string;
};

function RoleLoadingView({
  message = 'Verifying access…',
}: RoleLoadingViewProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default RoleLoadingView;

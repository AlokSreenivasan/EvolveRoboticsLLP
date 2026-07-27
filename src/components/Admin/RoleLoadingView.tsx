import React from 'react';
import { StyleSheet, View } from 'react-native';

import ScreenStateCard from '../ui/ScreenStateCard';
import { colors, spacing } from '../../constants/theme';

type RoleLoadingViewProps = {
  message?: string;
};

function RoleLoadingView({
  message = 'Verifying access…',
}: RoleLoadingViewProps) {
  return (
    <View style={styles.container}>
      <ScreenStateCard
        variant="loading"
        message={message}
        style={styles.card}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenHorizontal + 8,
  },
  card: {
    width: '100%',
    maxWidth: 360,
  },
});

export default RoleLoadingView;

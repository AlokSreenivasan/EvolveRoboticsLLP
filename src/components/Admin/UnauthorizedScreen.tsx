import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import AccessDenied from './AccessDenied';
import { colors } from '../../constants/theme';

type UnauthorizedScreenProps = {
  onGoHome?: () => void;
};

/**
 * Full-screen unauthorized state for blocked admin navigation.
 */
function UnauthorizedScreen({ onGoHome }: UnauthorizedScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <AccessDenied
        title="Unauthorized"
        description="This section is restricted to administrators. If you believe this is an error, contact support."
        actionLabel="Return to Home"
        onActionPress={onGoHome}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default UnauthorizedScreen;

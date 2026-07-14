import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import AccessDenied from './AccessDenied';
import { colors } from '../../constants/theme';

type UnauthorizedScreenProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onGoHome?: () => void;
};

/**
 * Full-screen unauthorized state for blocked admin navigation.
 */
function UnauthorizedScreen({
  title = 'Unauthorized',
  description = 'This section is restricted to administrators. If you believe this is an error, contact support.',
  actionLabel = 'Return to Home',
  onGoHome,
}: UnauthorizedScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <AccessDenied
        title={title}
        description={description}
        actionLabel={actionLabel}
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

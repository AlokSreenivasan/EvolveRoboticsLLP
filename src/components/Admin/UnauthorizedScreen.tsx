import React from 'react';
import { StyleSheet } from 'react-native';
import AccessDenied from './AccessDenied';
import { colors } from '../../constants/theme';
import ScreenSafeArea from '../ui/ScreenSafeArea';

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
    <ScreenSafeArea style={styles.safe}>
      <AccessDenied
        title={title}
        description={description}
        actionLabel={actionLabel}
        onActionPress={onGoHome}
      />
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default UnauthorizedScreen;

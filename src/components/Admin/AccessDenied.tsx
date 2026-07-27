import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ShieldX } from 'lucide-react-native';

import AppButton from '../AppButton';
import ScreenStateCard from '../ui/ScreenStateCard';
import { colors, spacing } from '../../constants/theme';

type AccessDeniedProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

function AccessDenied({
  title = 'Access denied',
  description = 'You do not have permission to view this area. Administrator access is required.',
  actionLabel = 'Go to Home',
  onActionPress,
}: AccessDeniedProps) {
  return (
    <View style={styles.container}>
      <ScreenStateCard
        variant="empty"
        Icon={ShieldX}
        title={title}
        message={description}
        style={styles.card}>
        {onActionPress ? (
          <AppButton
            title={actionLabel}
            onPress={onActionPress}
            variant="primary"
            buttonStyle={styles.button}
          />
        ) : null}
      </ScreenStateCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenHorizontal + 8,
    backgroundColor: colors.background,
  },
  card: {
    width: '100%',
    maxWidth: 360,
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 32,
    minWidth: 200,
  },
});

export default AccessDenied;

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ShieldX } from 'lucide-react-native';

import AppButton from '../AppButton';
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
      <View style={styles.iconWrap}>
        <ShieldX size={40} color={colors.primary} strokeWidth={2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onActionPress ? (
        <AppButton
          title={actionLabel}
          onPress={onActionPress}
          buttonStyle={styles.button}
          textStyle={styles.buttonText}
        />
      ) : null}
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
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    minWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AccessDenied;

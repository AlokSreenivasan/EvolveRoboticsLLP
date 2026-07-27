import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

import {
  colors,
  primaryButtonStyle,
  secondaryButtonStyle,
  typography,
} from '../constants/theme';

type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface AppButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  variant?: AppButtonVariant;
  accessibilityLabel?: string;
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  buttonStyle,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary',
  accessibilityLabel,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        variant === 'ghost' && styles.ghost,
        buttonStyle,
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' || variant === 'ghost' ? colors.primary : '#fff'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'secondary' && styles.textSecondary,
            variant === 'ghost' && styles.textGhost,
            variant === 'danger' && styles.textDanger,
            textStyle,
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    ...primaryButtonStyle,
  },
  secondary: {
    ...secondaryButtonStyle,
  },
  danger: {
    ...primaryButtonStyle,
    backgroundColor: colors.danger,
  },
  ghost: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  text: {
    ...typography.button,
    color: '#fff',
    textAlign: 'center',
  },
  textSecondary: {
    color: colors.primary,
  },
  textGhost: {
    color: colors.primary,
  },
  textDanger: {
    color: '#fff',
  },
  disabled: {
    opacity: 0.55,
  },
});

export default AppButton;

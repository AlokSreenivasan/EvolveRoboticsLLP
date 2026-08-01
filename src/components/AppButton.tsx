import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';

import {
  buttonVariants,
  primaryButtonStyle,
  typography,
  type ButtonVariantName,
} from '../constants/theme';
import TactileButton from './ui/TactileButton';

interface AppButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariantName;
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
  const palette = buttonVariants[variant];

  return (
    <TactileButton
      variant={variant}
      style={[styles.base, buttonStyle]}
      onPress={onPress}
      disabled={isDisabled}
      busy={loading}
      accessibilityLabel={accessibilityLabel ?? title}>
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <Text style={[styles.text, { color: palette.text }, textStyle]}>
          {title}
        </Text>
      )}
    </TactileButton>
  );
};

const styles = StyleSheet.create({
  base: {
    ...primaryButtonStyle,
  },
  text: {
    ...typography.button,
    textAlign: 'center',
    flexShrink: 1,
  },
});

export default AppButton;

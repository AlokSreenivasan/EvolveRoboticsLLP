import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../constants/theme';

export const backButtonOverlayStyle: ViewStyle = {
  position: 'absolute',
  left: 16,
  top: 0,
  bottom: 0,
  justifyContent: 'center',
  zIndex: 2,
};

type BackButtonProps = {
  onPress?: () => void;
  label?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Adds margin below when stacked above a page title block. */
  withSpacingBelow?: boolean;
};

function BackButton({
  onPress,
  label = '← Back',
  disabled = false,
  style,
  withSpacingBelow = false,
}: BackButtonProps) {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      hitSlop={8}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={[styles.button, withSpacingBelow && styles.spacingBelow, style]}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 4,
    paddingRight: 4,
    alignSelf: 'flex-start',
  },
  spacingBelow: {
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default BackButton;

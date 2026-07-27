import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

import {
  cardShadowLight,
  colors,
  glassBorder,
} from '../constants/theme';

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
  label = 'Back',
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
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={[styles.button, withSpacingBelow && styles.spacingBelow, style]}>
      <View style={styles.chip}>
        <ChevronLeft size={18} color={colors.primary} strokeWidth={2.5} />
        <Text style={styles.text}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
  },
  spacingBelow: {
    marginBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 8,
    paddingLeft: 6,
    paddingRight: 12,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    minHeight: 36,
    ...glassBorder,
    borderColor: colors.primaryMuted,
    ...cardShadowLight,
  },
  text: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
});

export default BackButton;

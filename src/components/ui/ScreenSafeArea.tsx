import React from 'react';
import {
  Platform,
  StatusBar,
  View,
  type ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenSafeAreaProps = ViewProps & {
  /** Skip bottom inset when a custom tab bar already consumes it. */
  includeBottomInset?: boolean;
};

/**
 * Screen shell that clears the status bar and 3-button nav bar.
 * RN's built-in SafeAreaView often reports a 0 top inset on Android
 * devices with a system navigation bar, which tucks the app Back button
 * under the notification shade.
 */
function ScreenSafeArea({
  style,
  includeBottomInset = true,
  children,
  ...props
}: ScreenSafeAreaProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  );

  return (
    <View
      {...props}
      style={[
        style,
        {
          paddingTop: topInset,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: includeBottomInset ? insets.bottom : 0,
        },
      ]}>
      {children}
    </View>
  );
}

export default ScreenSafeArea;

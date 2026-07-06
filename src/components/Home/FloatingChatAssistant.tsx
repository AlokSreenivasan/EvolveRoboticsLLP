import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cardShadow } from '../../constants/theme';

/** Material Design FAB — slightly above standard for visibility. */
const ANDROID_ASSISTANT_SIZE = 98;
/** iOS floating action target — above the 44pt HIG minimum. */
const IOS_ASSISTANT_SIZE = 98;

const ASSISTANT_SIZE = Platform.select({
  ios: IOS_ASSISTANT_SIZE,
  android: ANDROID_ASSISTANT_SIZE,
  default: ANDROID_ASSISTANT_SIZE,
}) as number;

const TAB_BAR_CLEARANCE = 72;

type FloatingChatAssistantProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

function FloatingChatAssistant({ onPress, style }: FloatingChatAssistantProps) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open chat assistant"
      style={[
        styles.container,
        cardShadow,
        {
          width: ASSISTANT_SIZE,
          height: ASSISTANT_SIZE,
          bottom: TAB_BAR_CLEARANCE + Math.max(insets.bottom, 8),
        },
        style,
      ]}>
      <Image
        source={require('../../assets/chat-assistant.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default FloatingChatAssistant;

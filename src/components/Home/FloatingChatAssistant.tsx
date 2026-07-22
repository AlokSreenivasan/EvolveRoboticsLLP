import React, { useEffect } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
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

/** Heartbeat: quick double-pulse, then a longer rest. */
const BEAT_UP = 180;
const BEAT_DOWN = 180;
const BEAT_GAP = 120;
const REST = 2200;
const PEAK_SCALE = 1.12;

type FloatingChatAssistantProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

function FloatingChatAssistant({ onPress, style }: FloatingChatAssistantProps) {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  useEffect(() => {
    const ease = Easing.out(Easing.quad);
    scale.value = withRepeat(
      withSequence(
        withTiming(PEAK_SCALE, { duration: BEAT_UP, easing: ease }),
        withTiming(1, { duration: BEAT_DOWN, easing: ease }),
        withDelay(
          BEAT_GAP,
          withTiming(PEAK_SCALE, { duration: BEAT_UP, easing: ease }),
        ),
        withTiming(1, { duration: BEAT_DOWN, easing: ease }),
        withTiming(1, { duration: REST }),
      ),
      -1,
      false,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        cardShadow,
        {
          width: ASSISTANT_SIZE,
          height: ASSISTANT_SIZE,
          bottom: TAB_BAR_CLEARANCE + Math.max(insets.bottom, 8),
        },
        animatedStyle,
        style,
      ]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Open chat assistant"
        style={styles.pressable}>
        <Image
          source={require('../../assets/chat-assistant.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  pressable: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default FloatingChatAssistant;

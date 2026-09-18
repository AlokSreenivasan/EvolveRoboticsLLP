import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  cardShadowLight,
  colors,
  glassBorder,
  spacing,
} from '../../constants/theme';

const DOT_SIZE = 7;

function TypingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }),
          withTiming(0.35, { duration: 280, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

function ChatTypingIndicator() {
  return (
    <View style={styles.row}>
      <Image
        source={require('../../assets/chat-assistant.webp')}
        style={styles.avatar}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <View
        style={styles.bubble}
        accessibilityRole="text"
        accessibilityLabel="Assistant is typing">
        <TypingDot delay={0} />
        <TypingDot delay={140} />
        <TypingDot delay={280} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
    maxWidth: '88%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    marginBottom: 2,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: spacing.cardRadius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    ...glassBorder,
    ...cardShadowLight,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.primary,
  },
});

export default ChatTypingIndicator;

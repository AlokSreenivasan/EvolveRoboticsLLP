import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { colors } from '../../../constants/theme';

type QuizRobotIllustrationProps = {
  size?: number;
};

/**
 * Decorative quiz mascot for the home quiz competition panel —
 * rounded robot holding a tablet with a question-mark speech bubble.
 */
function QuizRobotIllustration({ size = 96 }: QuizRobotIllustrationProps) {
  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <LinearGradient id="robotBody" x1="20%" y1="0%" x2="80%" y2="100%">
            <Stop offset="0%" stopColor={colors.primarySoft} />
            <Stop offset="55%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.primaryDark} />
          </LinearGradient>
          <LinearGradient id="robotFace" x1="30%" y1="0%" x2="70%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor={colors.primaryMuted} />
          </LinearGradient>
          <LinearGradient id="tabletFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primaryDark} />
            <Stop offset="100%" stopColor="#5a1550" />
          </LinearGradient>
        </Defs>

        {/* Soft ground glow */}
        <Ellipse
          cx="60"
          cy="108"
          rx="34"
          ry="7"
          fill={colors.primaryMuted}
          opacity="0.55"
        />

        {/* Antenna */}
        <Path
          d="M60 18 V28"
          stroke={colors.primary}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Circle cx="60" cy="15" r="5" fill={colors.primarySoft} />
        <Circle cx="60" cy="15" r="2.5" fill="#fff" />

        {/* Ears / side nodes */}
        <Circle cx="28" cy="48" r="7" fill={colors.primary} />
        <Circle cx="28" cy="48" r="3.2" fill={colors.primaryMuted} />
        <Circle cx="92" cy="48" r="7" fill={colors.primary} />
        <Circle cx="92" cy="48" r="3.2" fill={colors.primaryMuted} />

        {/* Head */}
        <Rect
          x="34"
          y="28"
          width="52"
          height="40"
          rx="16"
          fill="url(#robotBody)"
        />
        <Rect
          x="40"
          y="34"
          width="40"
          height="26"
          rx="12"
          fill="url(#robotFace)"
        />

        {/* Eyes */}
        <Circle cx="50" cy="46" r="4.5" fill={colors.primaryDark} />
        <Circle cx="70" cy="46" r="4.5" fill={colors.primaryDark} />
        <Circle cx="51.5" cy="44.5" r="1.6" fill="#fff" />
        <Circle cx="71.5" cy="44.5" r="1.6" fill="#fff" />

        {/* Smile */}
        <Path
          d="M52 54 Q60 60 68 54"
          stroke={colors.primary}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body */}
        <Rect
          x="40"
          y="68"
          width="40"
          height="28"
          rx="12"
          fill="url(#robotBody)"
        />
        <Rect
          x="48"
          y="74"
          width="24"
          height="10"
          rx="5"
          fill="rgba(255,255,255,0.28)"
        />

        {/* Arms */}
        <Path
          d="M40 76 C30 78 24 84 22 92"
          stroke={colors.primary}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <Path
          d="M80 76 C90 78 96 84 98 92"
          stroke={colors.primary}
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Tablet */}
        <Rect
          x="34"
          y="88"
          width="52"
          height="18"
          rx="5"
          fill="url(#tabletFill)"
          stroke={colors.primaryMuted}
          strokeWidth="1.5"
        />
        <Rect
          x="40"
          y="92"
          width="40"
          height="10"
          rx="2.5"
          fill={colors.primarySoft}
          opacity="0.85"
        />
        <Path
          d="M46 97 H74"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* Speech bubble */}
        <Circle cx="96" cy="22" r="14" fill={colors.primary} />
        <Circle
          cx="96"
          cy="22"
          r="14"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
          fill="none"
        />
        <Path
          d="M88 32 L84 40 L94 34 Z"
          fill={colors.primary}
        />
        <Path
          d="M96 15.5 C93.2 15.5 91 17.6 91 20.2 C91 22 92.1 23.5 93.8 24.2 L93.2 28 H98.8 L98.2 24.2 C99.9 23.5 101 22 101 20.2 C101 17.6 98.8 15.5 96 15.5 Z"
          fill="#fff"
        />
        <Circle cx="96" cy="30.5" r="1.4" fill="#fff" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(QuizRobotIllustration);

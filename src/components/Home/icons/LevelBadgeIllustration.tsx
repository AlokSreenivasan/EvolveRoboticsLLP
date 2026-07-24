import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { colors } from '../../../constants/theme';

type LevelBadgeIllustrationProps = {
  size?: number;
};

/**
 * Decorative level badge for the home streak board — hexagon, star, orbital ring.
 * Colors follow the Evolve primary magenta palette.
 */
function LevelBadgeIllustration({ size = 118 }: LevelBadgeIllustrationProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <LinearGradient id="hexFill" x1="20%" y1="0%" x2="80%" y2="100%">
            <Stop offset="0%" stopColor={colors.primarySoft} stopOpacity="1" />
            <Stop offset="45%" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.primaryDark} stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="hexEdge" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primaryMuted} stopOpacity="0.95" />
            <Stop offset="100%" stopColor={colors.primarySoft} stopOpacity="0.55" />
          </LinearGradient>
          <RadialGradient id="glow" cx="50%" cy="45%" r="50%">
            <Stop offset="0%" stopColor={colors.primaryLight} stopOpacity="0.55" />
            <Stop offset="55%" stopColor={colors.primaryMuted} stopOpacity="0.22" />
            <Stop offset="100%" stopColor={colors.primaryDark} stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="starFill" x1="30%" y1="0%" x2="70%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.primaryMuted} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        <Circle cx="60" cy="60" r="52" fill="url(#glow)" />

        {/* Orbital ring */}
        <Ellipse
          cx="60"
          cy="62"
          rx="46"
          ry="18"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="2.2"
          fill="none"
          transform="rotate(-28 60 62)"
        />
        <Ellipse
          cx="60"
          cy="62"
          rx="46"
          ry="18"
          stroke="rgba(238,205,244,0.4)"
          strokeWidth="5"
          fill="none"
          transform="rotate(-28 60 62)"
        />

        {/* Hexagon badge */}
        <Path
          d="M60 18 L92 36 L92 72 L60 90 L28 72 L28 36 Z"
          fill="url(#hexFill)"
          stroke="url(#hexEdge)"
          strokeWidth="2.5"
        />
        <Path
          d="M60 26 L84 40 L84 68 L60 82 L36 68 L36 40 Z"
          fill="rgba(255,255,255,0.08)"
        />

        {/* Center star */}
        <Path
          d="M60 38 L64.2 50.2 L77 50.6 L66.8 58.4 L70.4 70.5 L60 63.2 L49.6 70.5 L53.2 58.4 L43 50.6 L55.8 50.2 Z"
          fill="url(#starFill)"
        />

        {/* Sparkles */}
        <G fill="#FFFFFF">
          <Path d="M96 28 L98 34 L104 36 L98 38 L96 44 L94 38 L88 36 L94 34 Z" opacity="0.95" />
          <Path d="M22 48 L23.2 51.2 L26.5 52.2 L23.2 53.2 L22 56.5 L20.8 53.2 L17.5 52.2 L20.8 51.2 Z" opacity="0.75" />
          <Path d="M102 72 L103 75 L106 76 L103 77 L102 80 L101 77 L98 76 L101 75 Z" opacity="0.7" />
          <Circle cx="30" cy="30" r="1.6" opacity="0.85" />
          <Circle cx="88" cy="86" r="1.4" opacity="0.7" />
          <Circle cx="48" cy="22" r="1.2" opacity="0.65" />
        </G>
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

export default React.memo(LevelBadgeIllustration);

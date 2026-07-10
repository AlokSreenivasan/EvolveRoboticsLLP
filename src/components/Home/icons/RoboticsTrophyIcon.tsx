import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type RoboticsTrophyIconProps = {
  size?: number;
  primaryColor?: string;
  accentColor?: string;
  ringColor?: string;
  ringFill?: string;
};

/**
 * Trophy with robotics accents (gear + circuit nodes) for level achievements.
 */
function RoboticsTrophyIcon({
  size = 52,
  primaryColor = '#a42a8b',
  accentColor = '#FF9800',
  ringColor = '#eecdf4',
  ringFill = '#FAF2FF',
}: RoboticsTrophyIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <Circle cx="26" cy="26" r="24" fill={ringFill} />
      <Circle cx="26" cy="26" r="24" stroke={ringColor} strokeWidth="1.5" />

      <Path
        d="M17 18v3.5a7 7 0 0014 0V18"
        stroke={primaryColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19 18h14a1 1 0 011 1v1.5a5 5 0 01-10 0 5 5 0 01-10 0V19a1 1 0 011-1Z"
        fill={primaryColor}
        fillOpacity="0.12"
        stroke={primaryColor}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <Path
        d="M24 31h4v5h-4zM21 36h10v2.5a1 1 0 01-1 1h-8a1 1 0 01-1-1V36Z"
        fill={primaryColor}
        fillOpacity="0.18"
        stroke={primaryColor}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <Path
        d="M15.5 20.5H13a1 1 0 00-1 1v1.25a2.25 2.25 0 002.25 2.25H15M36.5 20.5H39a1 1 0 011 1v1.25a2.25 2.25 0 01-2.25 2.25H37"
        stroke={primaryColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Circle
        cx="38.5"
        cy="14.5"
        r="5.25"
        stroke={accentColor}
        strokeWidth="1.5"
      />
      <Circle cx="38.5" cy="14.5" r="1.5" fill={accentColor} />
      <Path
        d="M38.5 9.25v1.5M38.5 17.25v1.5M33.25 14.5h1.5M41.75 14.5h1.5"
        stroke={accentColor}
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      <Rect
        x="11.5"
        y="30.5"
        width="3"
        height="3"
        rx="0.75"
        fill={accentColor}
      />
      <Path
        d="M14.5 32h4.5M11.5 35.5h7"
        stroke={accentColor}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default RoboticsTrophyIcon;

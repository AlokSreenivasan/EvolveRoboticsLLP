import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

type QuizCompetitionIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

/**
 * Quick-access icon: trophy (competition) with quiz-card lines and a question badge.
 * Stroke style matches lucide-react-native icons used across the app.
 */
function QuizCompetitionIcon({
  size = 24,
  color = '#4A90E2',
  strokeWidth = 2,
}: QuizCompetitionIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9V5a1 1 0 011-1h10a1 1 0 011 1v4a4 4 0 01-8 0 4 4 0 01-8 0Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 21h8M12 17v4M5 7H3a1 1 0 00-1 1v1a2 2 0 002 2h1M19 7h2a1 1 0 011 1v1a2 2 0 01-2 2h-1"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 7.5h2M9.5 10h3.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle
        cx="17.5"
        cy="5.5"
        r="3"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M17.5 4.25v2M17.5 7.25h.01"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default QuizCompetitionIcon;

import React from 'react';
import Svg, { Path } from 'react-native-svg';

type ChatForumIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

/**
 * Quick-access icon: overlapping speech bubbles for chat / forum.
 * Stroke style matches lucide-react-native icons used across the app.
 */
function ChatForumIcon({
  size = 24,
  color = '#00ACC1',
  strokeWidth = 2,
}: ChatForumIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 14.5H5.5A2.5 2.5 0 013 12V6.5A2.5 2.5 0 015.5 4h8A2.5 2.5 0 0116 6.5V7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 10.5h9A2.5 2.5 0 0120 13v5.2a.4.4 0 01-.65.31L16.7 16.5H8.5A2.5 2.5 0 016 14v-1a2.5 2.5 0 012.5-2.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11 13.25h5M11 15.5h3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default ChatForumIcon;

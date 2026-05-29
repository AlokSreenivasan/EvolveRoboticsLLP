import React, { useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import YoutubePlayer, { PLAYER_STATES } from 'react-native-youtube-iframe';

import { colors } from '../../constants/theme';

type CourseVideoPlayerProps = {
  videoId: string;
  onEnded?: () => void;
};

function CourseVideoPlayer({ videoId, onEnded }: CourseVideoPlayerProps) {
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    if (width <= 0 || width === size.width) {
      return;
    }
    setSize({ width, height: Math.round((width * 9) / 16) });
  };

  return (
    <View style={styles.frame} onLayout={handleLayout}>
      {size.width > 0 ? (
        <YoutubePlayer
          height={size.height}
          width={size.width}
          play={playing}
          videoId={videoId}
          forceAndroidAutoplay
          initialPlayerParams={{
            controls: true,
            modestbranding: true,
            rel: false,
            iv_load_policy: 3,
          }}
          viewContainerStyle={{ width: size.width, height: size.height }}
          webViewStyle={{ width: size.width, height: size.height }}
          webViewProps={{ androidLayerType: 'hardware' }}
          onReady={() => setReady(true)}
          onChangeState={state => {
            if (state === PLAYER_STATES.ENDED) {
              setPlaying(false);
              onEnded?.();
            }
            if (state === PLAYER_STATES.PLAYING) {
              setPlaying(true);
            }
          }}
        />
      ) : null}

      {!ready && size.width > 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : null}

      <View style={styles.brandingShield} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    zIndex: 2,
  },
  brandingShield: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 168,
    height: 40,
    backgroundColor: '#000',
    zIndex: 10,
    ...Platform.select({
      android: { elevation: 10 },
      default: {},
    }),
  },
});

export default CourseVideoPlayer;

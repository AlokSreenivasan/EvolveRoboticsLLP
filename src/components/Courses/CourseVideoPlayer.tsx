import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import YoutubePlayer, {
  PLAYER_STATES,
  type YoutubeIframeRef,
} from 'react-native-youtube-iframe';

import { colors } from '../../constants/theme';
import { VIDEO_UNLOCK_WATCH_SECONDS } from '../../utils/continueLearning/formatVideoProgress';

const WATCH_POLL_INTERVAL_MS = 1000;
const WATCH_SAVE_INTERVAL_SECONDS = 15;

type CourseVideoPlayerProps = {
  videoId: string;
  initialWatchSeconds?: number;
  onEnded?: () => void;
  onWatchProgress?: (watchSeconds: number) => void;
};

function CourseVideoPlayer({
  videoId,
  initialWatchSeconds = 0,
  onEnded,
  onWatchProgress,
}: CourseVideoPlayerProps) {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const accumulatedSecondsRef = useRef(Math.max(0, Math.trunc(initialWatchSeconds)));
  const lastPollAtRef = useRef<number | null>(null);
  const lastSavedSecondsRef = useRef(Math.max(0, Math.trunc(initialWatchSeconds)));
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    accumulatedSecondsRef.current = Math.max(
      0,
      Math.trunc(initialWatchSeconds),
    );
    lastSavedSecondsRef.current = Math.max(
      0,
      Math.trunc(initialWatchSeconds),
    );
    lastPollAtRef.current = null;
  }, [videoId, initialWatchSeconds]);

  useEffect(() => {
    if (!ready || !playing || !onWatchProgress) {
      lastPollAtRef.current = null;
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      if (lastPollAtRef.current !== null) {
        const elapsedSeconds = (now - lastPollAtRef.current) / 1000;
        accumulatedSecondsRef.current += elapsedSeconds;
        const roundedSeconds = Math.floor(accumulatedSecondsRef.current);
        const crossedUnlockThreshold =
          roundedSeconds >= VIDEO_UNLOCK_WATCH_SECONDS &&
          lastSavedSecondsRef.current < VIDEO_UNLOCK_WATCH_SECONDS;
        const shouldSave =
          roundedSeconds > lastSavedSecondsRef.current &&
          (crossedUnlockThreshold ||
            roundedSeconds - lastSavedSecondsRef.current >=
              WATCH_SAVE_INTERVAL_SECONDS);

        if (shouldSave) {
          lastSavedSecondsRef.current = roundedSeconds;
          onWatchProgress(roundedSeconds);
        }
      }
      lastPollAtRef.current = now;
    }, WATCH_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [ready, playing, onWatchProgress]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    if (width <= 0 || width === size.width) {
      return;
    }
    setSize({ width, height: Math.round((width * 9) / 16) });
  };

  const flushWatchProgress = () => {
    if (!onWatchProgress) {
      return;
    }
    const roundedSeconds = Math.floor(accumulatedSecondsRef.current);
    if (roundedSeconds > lastSavedSecondsRef.current) {
      lastSavedSecondsRef.current = roundedSeconds;
      onWatchProgress(roundedSeconds);
    }
  };

  return (
    <View style={styles.frame} onLayout={handleLayout}>
      {size.width > 0 ? (
        <YoutubePlayer
          ref={playerRef}
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
          onChangeState={(state: PLAYER_STATES) => {
            if (state === PLAYER_STATES.ENDED) {
              setPlaying(false);
              flushWatchProgress();
              onEnded?.();
            }
            if (state === PLAYER_STATES.PAUSED) {
              setPlaying(false);
              flushWatchProgress();
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

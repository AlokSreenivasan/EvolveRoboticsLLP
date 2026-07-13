import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import {
  VIDEO_UNLOCK_WATCH_SECONDS,
  isPlaybackNearEnd,
} from '../../utils/continueLearning/formatVideoProgress';

const WATCH_POLL_INTERVAL_MS = 1000;
const WATCH_SAVE_INTERVAL_SECONDS = 15;

type CourseVideoPlayerProps = {
  videoId: string;
  initialWatchSeconds?: number;
  onEnded?: () => void;
  onWatchProgress?: (watchSeconds: number) => void;
  /** Fires when playback enters/leaves the last minute of the video. */
  onNearEndChange?: (isNearEnd: boolean) => void;
};

function CourseVideoPlayer({
  videoId,
  initialWatchSeconds = 0,
  onEnded,
  onWatchProgress,
  onNearEndChange,
}: CourseVideoPlayerProps) {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const accumulatedSecondsRef = useRef(
    Math.max(0, Math.trunc(initialWatchSeconds)),
  );
  const lastPollAtRef = useRef<number | null>(null);
  const lastSavedSecondsRef = useRef(Math.max(0, Math.trunc(initialWatchSeconds)));
  const nearEndRef = useRef(false);
  const onWatchProgressRef = useRef(onWatchProgress);
  const onNearEndChangeRef = useRef(onNearEndChange);
  const onEndedRef = useRef(onEnded);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  onWatchProgressRef.current = onWatchProgress;
  onNearEndChangeRef.current = onNearEndChange;
  onEndedRef.current = onEnded;

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
    nearEndRef.current = false;
    onNearEndChangeRef.current?.(false);
  }, [videoId]);

  // Live progress updates from the parent should only raise the floor, not
  // reset near-end / unlock state mid-playback.
  useEffect(() => {
    const seeded = Math.max(0, Math.trunc(initialWatchSeconds));
    accumulatedSecondsRef.current = Math.max(
      accumulatedSecondsRef.current,
      seeded,
    );
    lastSavedSecondsRef.current = Math.max(
      lastSavedSecondsRef.current,
      seeded,
    );
  }, [initialWatchSeconds]);

  const persistWatchProgress = useCallback((seconds: number) => {
    const callback = onWatchProgressRef.current;
    if (!callback) {
      return;
    }
    // Cap below the unlock threshold until the last minute so early playtime
    // does not unlock the next lesson or the Next Video button.
    const reportableSeconds = nearEndRef.current
      ? Math.max(Math.floor(seconds), VIDEO_UNLOCK_WATCH_SECONDS)
      : Math.min(Math.floor(seconds), VIDEO_UNLOCK_WATCH_SECONDS - 1);
    if (reportableSeconds > lastSavedSecondsRef.current) {
      lastSavedSecondsRef.current = reportableSeconds;
      callback(reportableSeconds);
    }
  }, []);

  const markNearEndAndUnlock = useCallback(() => {
    if (!nearEndRef.current) {
      nearEndRef.current = true;
      onNearEndChangeRef.current?.(true);
    }
    const unlockSeconds = Math.max(
      Math.floor(accumulatedSecondsRef.current),
      VIDEO_UNLOCK_WATCH_SECONDS,
    );
    accumulatedSecondsRef.current = Math.max(
      accumulatedSecondsRef.current,
      unlockSeconds,
    );
    persistWatchProgress(unlockSeconds);
  }, [persistWatchProgress]);

  useEffect(() => {
    if (!ready) {
      lastPollAtRef.current = null;
      return;
    }

    const interval = setInterval(() => {
      if (playing) {
        const now = Date.now();
        if (lastPollAtRef.current !== null) {
          const elapsedSeconds = (now - lastPollAtRef.current) / 1000;
          accumulatedSecondsRef.current += elapsedSeconds;
          const roundedSeconds = Math.floor(accumulatedSecondsRef.current);
          const shouldSave =
            roundedSeconds > lastSavedSecondsRef.current &&
            roundedSeconds - lastSavedSecondsRef.current >=
              WATCH_SAVE_INTERVAL_SECONDS;

          if (shouldSave) {
            persistWatchProgress(roundedSeconds);
          }
        }
        lastPollAtRef.current = now;
      } else {
        lastPollAtRef.current = null;
      }

      void (async () => {
        try {
          const [currentTime, duration] = await Promise.all([
            playerRef.current?.getCurrentTime(),
            playerRef.current?.getDuration(),
          ]);
          if (
            typeof currentTime !== 'number' ||
            typeof duration !== 'number' ||
            !Number.isFinite(currentTime) ||
            !Number.isFinite(duration)
          ) {
            return;
          }
          if (isPlaybackNearEnd(currentTime, duration)) {
            markNearEndAndUnlock();
          }
        } catch {
          // Player bridge can fail briefly while buffering; retry next poll.
        }
      })();
    }, WATCH_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [ready, playing, persistWatchProgress, markNearEndAndUnlock]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    if (width <= 0 || width === size.width) {
      return;
    }
    setSize({ width, height: Math.round((width * 9) / 16) });
  };

  const flushWatchProgress = () => {
    persistWatchProgress(accumulatedSecondsRef.current);
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
              markNearEndAndUnlock();
              flushWatchProgress();
              onEndedRef.current?.();
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

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { DEFAULT_IMPORTANT_UPDATES_SECTION } from '../../constants/importantUpdatesDefaults';
import { DEFAULT_UPCOMING_EVENTS_SECTION } from '../../constants/upcomingEventsDefaults';
import { subscribeContinueLearningPlaylists } from '../../services/firebase/continueLearningPlaylistsService';
import { subscribeContinueLearningProgress } from '../../services/firebase/continueLearningProgressService';
import {
  subscribeImportantUpdates,
  subscribeImportantUpdatesSection,
} from '../../services/firebase/importantUpdatesService';
import { subscribeNotifications } from '../../services/firebase/notificationsService';
import {
  subscribeUpcomingEvents,
  subscribeUpcomingEventsSection,
} from '../../services/firebase/upcomingEventsService';
import type { AppNotification } from '../../store/content/types/notifications.types';
import type { ContinueLearningPlaylist } from '../../store/content/types/continueLearningPlaylists.types';
import type { ContinueLearningProgress } from '../../store/content/types/continueLearningProgress.types';
import type {
  ImportantUpdateNotice,
  ImportantUpdatesSection,
} from '../../store/content/types/importantUpdates.types';
import type {
  UpcomingEvent,
  UpcomingEventsSection,
} from '../../store/content/types/upcomingEvents.types';
import { getErrorMessage } from '../../utils/firebase/errors';
import { useAuth } from './AuthContext';

export type HomeFeedContinueLearning = {
  playlists: ContinueLearningPlaylist[];
  loading: boolean;
  error: string | null;
};

export type HomeFeedProgress = {
  progressByPlaylistId: Record<string, ContinueLearningProgress>;
  getVideosWatched: (playlistId: string) => number;
  getHasStartedWatching: (playlistId: string) => boolean;
  loading: boolean;
  error: string | null;
};

export type HomeFeedImportantUpdates = {
  section: ImportantUpdatesSection;
  notices: ImportantUpdateNotice[];
  displayNotices: ImportantUpdateNotice[];
  loading: boolean;
  error: string | null;
};

export type HomeFeedUpcomingEvents = {
  section: UpcomingEventsSection;
  events: UpcomingEvent[];
  displayEvents: UpcomingEvent[];
  loading: boolean;
  error: string | null;
};

export type HomeFeedNotifications = {
  notifications: AppNotification[];
  displayNotifications: AppNotification[];
  loading: boolean;
  error: string | null;
};

export type HomeFeedContextValue = {
  continueLearning: HomeFeedContinueLearning;
  progress: HomeFeedProgress;
  importantUpdates: HomeFeedImportantUpdates;
  upcomingEvents: HomeFeedUpcomingEvents;
  notifications: HomeFeedNotifications;
  refreshing: boolean;
  refresh: () => void;
};

const HomeFeedContext = createContext<HomeFeedContextValue | null>(null);

type HomeFeedFocusRegistrar = () => () => void;

const HomeFeedFocusContext = createContext<HomeFeedFocusRegistrar | null>(null);

const EMPTY_CONTINUE_LEARNING: HomeFeedContinueLearning = {
  playlists: [],
  loading: true,
  error: null,
};

const EMPTY_PROGRESS: HomeFeedProgress = {
  progressByPlaylistId: {},
  getVideosWatched: () => 0,
  getHasStartedWatching: () => false,
  loading: true,
  error: null,
};

const EMPTY_IMPORTANT_UPDATES: HomeFeedImportantUpdates = {
  section: DEFAULT_IMPORTANT_UPDATES_SECTION,
  notices: [],
  displayNotices: [],
  loading: true,
  error: null,
};

const EMPTY_UPCOMING_EVENTS: HomeFeedUpcomingEvents = {
  section: DEFAULT_UPCOMING_EVENTS_SECTION,
  events: [],
  displayEvents: [],
  loading: true,
  error: null,
};

const EMPTY_NOTIFICATIONS: HomeFeedNotifications = {
  notifications: [],
  displayNotifications: [],
  loading: true,
  error: null,
};

type HomeFeedProviderProps = {
  children: React.ReactNode;
};

/**
 * Owns published home-feed Firestore listeners once for Home and
 * ContinueLearningList. Subscribes only while those routes are focused.
 */
export function HomeFeedProvider({ children }: HomeFeedProviderProps) {
  const { user } = useAuth();
  const [focusCount, setFocusCount] = useState(0);
  const isActive = focusCount > 0;

  const registerHomeFeedFocus = useCallback(() => {
    setFocusCount(count => count + 1);
    return () => setFocusCount(count => Math.max(0, count - 1));
  }, []);

  const [playlists, setPlaylists] = useState<ContinueLearningPlaylist[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(true);
  const [playlistsError, setPlaylistsError] = useState<string | null>(null);

  const [progressByPlaylistId, setProgressByPlaylistId] = useState<
    Record<string, ContinueLearningProgress>
  >({});
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState<string | null>(null);

  const [importantSection, setImportantSection] =
    useState<ImportantUpdatesSection>(DEFAULT_IMPORTANT_UPDATES_SECTION);
  const [notices, setNotices] = useState<ImportantUpdateNotice[]>([]);
  const [importantLoading, setImportantLoading] = useState(true);
  const [importantError, setImportantError] = useState<string | null>(null);

  const [eventsSection, setEventsSection] = useState<UpcomingEventsSection>(
    DEFAULT_UPCOMING_EVENTS_SECTION,
  );
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(
    null,
  );

  const [refreshNonce, setRefreshNonce] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => {
    if (!isActive || refreshing) {
      return;
    }
    setRefreshing(true);
    setRefreshNonce(n => n + 1);
  }, [isActive, refreshing]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let importantSectionReady = false;
    let importantNoticesReady = false;
    let eventsSectionReady = false;
    let eventsReady = false;

    setPlaylistsLoading(true);
    setImportantLoading(true);
    setEventsLoading(true);
    setNotificationsLoading(true);
    setPlaylistsError(null);
    setImportantError(null);
    setEventsError(null);
    setNotificationsError(null);

    const unsubPlaylists = subscribeContinueLearningPlaylists(
      next => {
        setPlaylists(next);
        setPlaylistsError(null);
        setPlaylistsLoading(false);
      },
      { includeUnpublished: false },
      err => {
        setPlaylistsError(getErrorMessage(err));
        setPlaylistsLoading(false);
      },
    );

    const markImportantReady = () => {
      if (importantSectionReady && importantNoticesReady) {
        setImportantLoading(false);
      }
    };

    const unsubImportantSection = subscribeImportantUpdatesSection(
      next => {
        setImportantSection(next);
        importantSectionReady = true;
        markImportantReady();
      },
      err => {
        setImportantError(getErrorMessage(err));
        importantSectionReady = true;
        markImportantReady();
      },
    );

    const unsubImportantNotices = subscribeImportantUpdates(
      next => {
        setNotices(next);
        setImportantError(null);
        importantNoticesReady = true;
        markImportantReady();
      },
      { includeUnpublished: false },
      err => {
        setImportantError(getErrorMessage(err));
        importantNoticesReady = true;
        markImportantReady();
      },
    );

    const markEventsReady = () => {
      if (eventsSectionReady && eventsReady) {
        setEventsLoading(false);
      }
    };

    const unsubEventsSection = subscribeUpcomingEventsSection(
      next => {
        setEventsSection(next);
        eventsSectionReady = true;
        markEventsReady();
      },
      err => {
        setEventsError(getErrorMessage(err));
        eventsSectionReady = true;
        markEventsReady();
      },
    );

    const unsubEvents = subscribeUpcomingEvents(
      next => {
        setEvents(next);
        setEventsError(null);
        eventsReady = true;
        markEventsReady();
      },
      { includeUnpublished: false },
      err => {
        setEventsError(getErrorMessage(err));
        eventsReady = true;
        markEventsReady();
      },
    );

    const unsubNotifications = subscribeNotifications(
      next => {
        setNotifications(next);
        setNotificationsError(null);
        setNotificationsLoading(false);
      },
      { includeUnpublished: false },
      err => {
        setNotificationsError(getErrorMessage(err));
        setNotificationsLoading(false);
      },
    );

    return () => {
      unsubPlaylists();
      unsubImportantSection();
      unsubImportantNotices();
      unsubEventsSection();
      unsubEvents();
      unsubNotifications();
    };
  }, [isActive, refreshNonce]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    if (!user) {
      setProgressByPlaylistId({});
      setProgressLoading(false);
      setProgressError(null);
      return;
    }

    setProgressLoading(true);
    setProgressError(null);
    const unsub = subscribeContinueLearningProgress(
      next => {
        setProgressByPlaylistId(next);
        setProgressError(null);
        setProgressLoading(false);
      },
      err => {
        setProgressError(getErrorMessage(err));
        setProgressLoading(false);
      },
    );

    return () => unsub();
  }, [isActive, refreshNonce, user]);

  useEffect(() => {
    if (!refreshing || !isActive) {
      return;
    }

    const allSettled =
      !playlistsLoading &&
      !importantLoading &&
      !eventsLoading &&
      !notificationsLoading &&
      !progressLoading;

    if (allSettled) {
      setRefreshing(false);
    }
  }, [
    eventsLoading,
    importantLoading,
    isActive,
    notificationsLoading,
    playlistsLoading,
    progressLoading,
    refreshing,
  ]);

  const getVideosWatched = useCallback(
    (playlistId: string) => progressByPlaylistId[playlistId]?.videosWatched ?? 0,
    [progressByPlaylistId],
  );

  const getHasStartedWatching = useCallback(
    (playlistId: string) =>
      progressByPlaylistId[playlistId]?.hasStartedWatching ?? false,
    [progressByPlaylistId],
  );

  const value = useMemo<HomeFeedContextValue>(
    () => ({
      continueLearning: {
        playlists,
        loading: isActive ? playlistsLoading : false,
        error: playlistsError,
      },
      progress: {
        progressByPlaylistId,
        getVideosWatched,
        getHasStartedWatching,
        loading: isActive ? progressLoading : false,
        error: progressError,
      },
      importantUpdates: {
        section: importantSection,
        notices,
        displayNotices: notices,
        loading: isActive ? importantLoading : false,
        error: importantError,
      },
      upcomingEvents: {
        section: eventsSection,
        events,
        displayEvents: events,
        loading: isActive ? eventsLoading : false,
        error: eventsError,
      },
      notifications: {
        notifications,
        displayNotifications: notifications,
        loading: isActive ? notificationsLoading : false,
        error: notificationsError,
      },
      refreshing,
      refresh,
    }),
    [
      events,
      eventsError,
      eventsLoading,
      eventsSection,
      getHasStartedWatching,
      getVideosWatched,
      importantError,
      importantLoading,
      importantSection,
      isActive,
      notices,
      notifications,
      notificationsError,
      notificationsLoading,
      playlists,
      playlistsError,
      playlistsLoading,
      progressByPlaylistId,
      progressError,
      progressLoading,
      refresh,
      refreshing,
    ],
  );

  return (
    <HomeFeedFocusContext.Provider value={registerHomeFeedFocus}>
      <HomeFeedContext.Provider value={value}>{children}</HomeFeedContext.Provider>
    </HomeFeedFocusContext.Provider>
  );
}

/**
 * Call from screens that display home feed data so listeners stay active
 * while Home, Continue Learning list, or Notifications list is focused.
 */
export function useHomeFeedFocus() {
  const register = useContext(HomeFeedFocusContext);
  useFocusEffect(
    useCallback(() => {
      if (!register) {
        return undefined;
      }
      return register();
    }, [register]),
  );
}

export function useHomeFeedOptional(): HomeFeedContextValue | null {
  return useContext(HomeFeedContext);
}

export function useHomeFeed(): HomeFeedContextValue {
  const ctx = useContext(HomeFeedContext);
  if (!ctx) {
    throw new Error('useHomeFeed must be used within HomeFeedProvider');
  }
  return ctx;
}

/** @internal Re-export slices with stable fallbacks when provider is absent. */
export function useHomeFeedContinueLearning(): HomeFeedContinueLearning {
  const ctx = useHomeFeedOptional();
  return ctx?.continueLearning ?? EMPTY_CONTINUE_LEARNING;
}

export function useHomeFeedProgress(): HomeFeedProgress {
  const ctx = useHomeFeedOptional();
  return ctx?.progress ?? EMPTY_PROGRESS;
}

export function useHomeFeedImportantUpdates(): HomeFeedImportantUpdates {
  const ctx = useHomeFeedOptional();
  return ctx?.importantUpdates ?? EMPTY_IMPORTANT_UPDATES;
}

export function useHomeFeedUpcomingEvents(): HomeFeedUpcomingEvents {
  const ctx = useHomeFeedOptional();
  return ctx?.upcomingEvents ?? EMPTY_UPCOMING_EVENTS;
}

export function useHomeFeedNotifications(): HomeFeedNotifications {
  const ctx = useHomeFeedOptional();
  return ctx?.notifications ?? EMPTY_NOTIFICATIONS;
}

export function useHomeFeedRefresh(): { refreshing: boolean; refresh: () => void } {
  const ctx = useHomeFeedOptional();
  return {
    refreshing: ctx?.refreshing ?? false,
    refresh: ctx?.refresh ?? (() => {}),
  };
}

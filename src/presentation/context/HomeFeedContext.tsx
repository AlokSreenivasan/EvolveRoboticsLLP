import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { DEFAULT_IMPORTANT_UPDATES_SECTION } from '../../constants/importantUpdatesDefaults';
import { DEFAULT_UPCOMING_EVENTS_SECTION } from '../../constants/upcomingEventsDefaults';
import {
  fetchContinueLearningPlaylistsPage,
  subscribeContinueLearningPlaylists,
} from '../../services/firebase/continueLearningPlaylistsService';
import { subscribeContinueLearningProgress } from '../../services/firebase/continueLearningProgressService';
import {
  fetchImportantUpdatesPage,
  subscribeImportantUpdates,
  subscribeImportantUpdatesSection,
} from '../../services/firebase/importantUpdatesService';
import {
  markNotificationAsRead,
  subscribeNotificationReads,
} from '../../services/firebase/notificationReadsService';
import {
  fetchNotificationsPage,
  subscribeNotifications,
} from '../../services/firebase/notificationsService';
import {
  fetchUpcomingEventsPage,
  subscribeUpcomingEvents,
  subscribeUpcomingEventsSection,
} from '../../services/firebase/upcomingEventsService';
import {
  fetchQuizCompetitionsPage,
  subscribeQuizCompetitions,
} from '../../services/firebase/quizCompetitionsService';
import {
  subscribeQuizAttempts,
  type QuizAttempt,
} from '../../services/firebase/quizAttemptsService';
import type { NotificationRead } from '../../store/content/types/notificationReads.types';
import type {
  AppNotification,
  LearnerNotification,
} from '../../store/content/types/notifications.types';
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
import type { QuizCompetition } from '../../store/content/types/quizCompetitions.types';
import { getErrorMessage } from '../../utils/firebase/errors';
import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import { usePagedContentList } from '../hooks/usePagedContentList';
import { useAuth } from './AuthContext';

export type HomeFeedPaged = {
  loadMore: () => void;
  loadingMore: boolean;
  hasMore: boolean;
};

export type HomeFeedContinueLearning = HomeFeedPaged & {
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

export type HomeFeedImportantUpdates = HomeFeedPaged & {
  section: ImportantUpdatesSection;
  notices: ImportantUpdateNotice[];
  displayNotices: ImportantUpdateNotice[];
  loading: boolean;
  error: string | null;
};

export type HomeFeedUpcomingEvents = HomeFeedPaged & {
  section: UpcomingEventsSection;
  events: UpcomingEvent[];
  displayEvents: UpcomingEvent[];
  loading: boolean;
  error: string | null;
};

export type HomeFeedNotifications = HomeFeedPaged & {
  notifications: AppNotification[];
  displayNotifications: LearnerNotification[];
  unreadCount: number;
  markNotificationRead: (notificationId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
};

export type HomeFeedQuizCompetitions = HomeFeedPaged & {
  quizzes: QuizCompetition[];
  loading: boolean;
  error: string | null;
};

export type HomeFeedQuizAttempts = {
  attempts: QuizAttempt[];
  loading: boolean;
  error: string | null;
};

export type HomeFeedContextValue = {
  continueLearning: HomeFeedContinueLearning;
  progress: HomeFeedProgress;
  importantUpdates: HomeFeedImportantUpdates;
  upcomingEvents: HomeFeedUpcomingEvents;
  notifications: HomeFeedNotifications;
  quizCompetitions: HomeFeedQuizCompetitions;
  quizAttempts: HomeFeedQuizAttempts;
  refreshing: boolean;
  refresh: () => void;
};

const HomeFeedContext = createContext<HomeFeedContextValue | null>(null);

const NOOP_PAGED: HomeFeedPaged = {
  loadMore: () => undefined,
  loadingMore: false,
  hasMore: false,
};

const EMPTY_CONTINUE_LEARNING: HomeFeedContinueLearning = {
  ...NOOP_PAGED,
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
  ...NOOP_PAGED,
  section: DEFAULT_IMPORTANT_UPDATES_SECTION,
  notices: [],
  displayNotices: [],
  loading: true,
  error: null,
};

const EMPTY_UPCOMING_EVENTS: HomeFeedUpcomingEvents = {
  ...NOOP_PAGED,
  section: DEFAULT_UPCOMING_EVENTS_SECTION,
  events: [],
  displayEvents: [],
  loading: true,
  error: null,
};

const EMPTY_NOTIFICATIONS: HomeFeedNotifications = {
  ...NOOP_PAGED,
  notifications: [],
  displayNotifications: [],
  unreadCount: 0,
  markNotificationRead: async () => undefined,
  loading: true,
  error: null,
};

const EMPTY_QUIZ_COMPETITIONS: HomeFeedQuizCompetitions = {
  ...NOOP_PAGED,
  quizzes: [],
  loading: true,
  error: null,
};

const EMPTY_QUIZ_ATTEMPTS: HomeFeedQuizAttempts = {
  attempts: [],
  loading: true,
  error: null,
};

type HomeFeedProviderProps = {
  children: React.ReactNode;
};

/**
 * Owns published home-feed Firestore listeners once for the signed-in
 * MainStack session (kept warm after leaving Home).
 */
function buildHomeFeedSubscribeOptions(
  isAdmin: boolean,
  track: string | null | undefined,
  schoolId: string | null | undefined,
  grade: string | null | undefined,
): ContentSubscribeOptions {
  if (isAdmin) {
    return { includeUnpublished: false };
  }

  const viewerTrack =
    track === 'kids' || track === 'professionals' ? track : undefined;
  const isKids = viewerTrack === 'kids';

  return {
    includeUnpublished: false,
    viewerTrack,
    ...(isKids
      ? {
          viewerSchoolId: schoolId ?? null,
          viewerGrade: grade ?? null,
        }
      : {}),
  };
}

export function HomeFeedProvider({ children }: HomeFeedProviderProps) {
  const { user, profile, isAdmin, roleLoading } = useAuth();
  const contentSubscribeOptions = useMemo(
    () =>
      buildHomeFeedSubscribeOptions(
        !roleLoading && isAdmin,
        profile?.track,
        profile?.schoolId,
        profile?.grade,
      ),
    [isAdmin, profile?.grade, profile?.schoolId, profile?.track, roleLoading],
  );
  const signedIn = Boolean(user);

  const [refreshNonce, setRefreshNonce] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const eventsSubscribeOptions = useMemo(
    () => ({ ...contentSubscribeOptions, unbounded: true }),
    [contentSubscribeOptions],
  );
  const playlistsPage = usePagedContentList({
    subscribe: subscribeContinueLearningPlaylists,
    fetchPage: fetchContinueLearningPlaylistsPage,
    options: contentSubscribeOptions,
    enabled: signedIn,
    resetKey: refreshNonce,
  });
  const noticesPage = usePagedContentList({
    subscribe: subscribeImportantUpdates,
    fetchPage: fetchImportantUpdatesPage,
    options: contentSubscribeOptions,
    enabled: signedIn,
    resetKey: refreshNonce,
  });
  const eventsPage = usePagedContentList({
    subscribe: subscribeUpcomingEvents,
    fetchPage: fetchUpcomingEventsPage,
    options: eventsSubscribeOptions,
    enabled: signedIn,
    resetKey: refreshNonce,
  });
  const notificationsPage = usePagedContentList({
    subscribe: subscribeNotifications,
    fetchPage: fetchNotificationsPage,
    options: contentSubscribeOptions,
    enabled: signedIn,
    resetKey: refreshNonce,
  });
  const quizzesPage = usePagedContentList({
    subscribe: subscribeQuizCompetitions,
    fetchPage: fetchQuizCompetitionsPage,
    options: contentSubscribeOptions,
    enabled: signedIn,
    resetKey: refreshNonce,
  });

  const [importantSection, setImportantSection] =
    useState<ImportantUpdatesSection>(DEFAULT_IMPORTANT_UPDATES_SECTION);
  const [importantSectionLoading, setImportantSectionLoading] = useState(true);
  const [importantSectionError, setImportantSectionError] = useState<
    string | null
  >(null);

  const [eventsSection, setEventsSection] = useState<UpcomingEventsSection>(
    DEFAULT_UPCOMING_EVENTS_SECTION,
  );
  const [eventsSectionLoading, setEventsSectionLoading] = useState(true);
  const [eventsSectionError, setEventsSectionError] = useState<string | null>(
    null,
  );

  const [progressByPlaylistId, setProgressByPlaylistId] = useState<
    Record<string, ContinueLearningProgress>
  >({});
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState<string | null>(null);

  const [readByNotificationId, setReadByNotificationId] = useState<
    Record<string, NotificationRead>
  >({});
  const [readsLoading, setReadsLoading] = useState(true);
  const [optimisticReadIds, setOptimisticReadIds] = useState<
    Record<string, true>
  >({});

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [attemptsError, setAttemptsError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (refreshing) {
      return;
    }
    setRefreshing(true);
    setRefreshNonce(n => n + 1);
  }, [refreshing]);

  useEffect(() => {
    if (!signedIn) {
      setImportantSection(DEFAULT_IMPORTANT_UPDATES_SECTION);
      setImportantSectionLoading(false);
      setImportantSectionError(null);
      setEventsSection(DEFAULT_UPCOMING_EVENTS_SECTION);
      setEventsSectionLoading(false);
      setEventsSectionError(null);
      return;
    }

    setImportantSectionError(null);
    setEventsSectionError(null);

    const unsubImportantSection = subscribeImportantUpdatesSection(
      next => {
        setImportantSection(next);
        setImportantSectionLoading(false);
      },
      err => {
        setImportantSectionError(getErrorMessage(err));
        setImportantSectionLoading(false);
      },
    );

    const unsubEventsSection = subscribeUpcomingEventsSection(
      next => {
        setEventsSection(next);
        setEventsSectionLoading(false);
      },
      err => {
        setEventsSectionError(getErrorMessage(err));
        setEventsSectionLoading(false);
      },
    );

    return () => {
      unsubImportantSection();
      unsubEventsSection();
    };
  }, [refreshNonce, signedIn]);

  useEffect(() => {
    if (!signedIn) {
      setProgressByPlaylistId({});
      setProgressLoading(false);
      setProgressError(null);
      setReadByNotificationId({});
      setReadsLoading(false);
      setOptimisticReadIds({});
      setAttempts([]);
      setAttemptsLoading(false);
      setAttemptsError(null);
      return;
    }

    setProgressError(null);
    const unsubProgress = subscribeContinueLearningProgress(
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

    const unsubReads = subscribeNotificationReads(
      next => {
        setReadByNotificationId(next);
        setOptimisticReadIds(prev => {
          const remaining: Record<string, true> = {};
          Object.keys(prev).forEach(id => {
            if (!next[id]) {
              remaining[id] = true;
            }
          });
          return remaining;
        });
        setReadsLoading(false);
      },
      () => {
        setReadsLoading(false);
      },
    );

    const unsubAttempts = subscribeQuizAttempts(
      next => {
        setAttempts(next);
        setAttemptsError(null);
        setAttemptsLoading(false);
      },
      err => {
        setAttemptsError(getErrorMessage(err));
        setAttemptsLoading(false);
      },
    );

    return () => {
      unsubProgress();
      unsubReads();
      unsubAttempts();
    };
  }, [refreshNonce, signedIn]);

  const playlistsLoading = playlistsPage.loading;
  const importantLoading = importantSectionLoading || noticesPage.loading;
  const eventsLoading = eventsSectionLoading || eventsPage.loading;
  const notificationsLoading = notificationsPage.loading;

  useEffect(() => {
    if (!refreshing) {
      return;
    }

    const allSettled =
      !playlistsLoading &&
      !importantLoading &&
      !eventsLoading &&
      !notificationsLoading &&
      !progressLoading &&
      !readsLoading &&
      !quizzesPage.loading &&
      !attemptsLoading;

    if (allSettled) {
      setRefreshing(false);
    }
  }, [
    attemptsLoading,
    eventsLoading,
    importantLoading,
    notificationsLoading,
    playlistsLoading,
    progressLoading,
    quizzesPage.loading,
    readsLoading,
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

  const isNotificationRead = useCallback(
    (notificationId: string) =>
      Boolean(readByNotificationId[notificationId]) ||
      Boolean(optimisticReadIds[notificationId]),
    [optimisticReadIds, readByNotificationId],
  );

  const displayNotifications = useMemo<LearnerNotification[]>(
    () =>
      notificationsPage.items.map(item => ({
        ...item,
        isRead: isNotificationRead(item.id),
      })),
    [isNotificationRead, notificationsPage.items],
  );

  const unreadCount = useMemo(
    () => displayNotifications.filter(item => !item.isRead).length,
    [displayNotifications],
  );

  const markNotificationRead = useCallback(async (notificationId: string) => {
    const trimmedId = notificationId.trim();
    if (
      !trimmedId ||
      readByNotificationId[trimmedId] ||
      optimisticReadIds[trimmedId]
    ) {
      return;
    }

    setOptimisticReadIds(prev => ({ ...prev, [trimmedId]: true }));

    try {
      await markNotificationAsRead(trimmedId);
    } catch {
      setOptimisticReadIds(prev => {
        if (!prev[trimmedId]) {
          return prev;
        }
        const next = { ...prev };
        delete next[trimmedId];
        return next;
      });
    }
  }, [optimisticReadIds, readByNotificationId]);

  const value = useMemo<HomeFeedContextValue>(
    () => ({
      continueLearning: {
        playlists: playlistsPage.items,
        loading: playlistsPage.loading,
        error: playlistsPage.error,
        loadMore: playlistsPage.loadMore,
        loadingMore: playlistsPage.loadingMore,
        hasMore: playlistsPage.hasMore,
      },
      progress: {
        progressByPlaylistId,
        getVideosWatched,
        getHasStartedWatching,
        loading: progressLoading,
        error: progressError,
      },
      importantUpdates: {
        section: importantSection,
        notices: noticesPage.items,
        displayNotices: noticesPage.items,
        loading: importantLoading,
        error: importantSectionError ?? noticesPage.error,
        loadMore: noticesPage.loadMore,
        loadingMore: noticesPage.loadingMore,
        hasMore: noticesPage.hasMore,
      },
      upcomingEvents: {
        section: eventsSection,
        events: eventsPage.items,
        displayEvents: eventsPage.items,
        loading: eventsLoading,
        error: eventsSectionError ?? eventsPage.error,
        loadMore: eventsPage.loadMore,
        loadingMore: eventsPage.loadingMore,
        hasMore: eventsPage.hasMore,
      },
      notifications: {
        notifications: notificationsPage.items,
        displayNotifications,
        unreadCount,
        markNotificationRead,
        loading: notificationsLoading || readsLoading,
        error: notificationsPage.error,
        loadMore: notificationsPage.loadMore,
        loadingMore: notificationsPage.loadingMore,
        hasMore: notificationsPage.hasMore,
      },
      quizCompetitions: {
        quizzes: quizzesPage.items,
        loading: quizzesPage.loading,
        error: quizzesPage.error,
        loadMore: quizzesPage.loadMore,
        loadingMore: quizzesPage.loadingMore,
        hasMore: quizzesPage.hasMore,
      },
      quizAttempts: {
        attempts,
        loading: attemptsLoading,
        error: attemptsError,
      },
      refreshing,
      refresh,
    }),
    [
      attempts,
      attemptsError,
      attemptsLoading,
      displayNotifications,
      eventsLoading,
      eventsPage.error,
      eventsPage.hasMore,
      eventsPage.items,
      eventsPage.loadMore,
      eventsPage.loadingMore,
      eventsSection,
      eventsSectionError,
      getHasStartedWatching,
      getVideosWatched,
      importantLoading,
      importantSection,
      importantSectionError,
      markNotificationRead,
      noticesPage.error,
      noticesPage.hasMore,
      noticesPage.items,
      noticesPage.loadMore,
      noticesPage.loadingMore,
      notificationsLoading,
      notificationsPage.error,
      notificationsPage.hasMore,
      notificationsPage.items,
      notificationsPage.loadMore,
      notificationsPage.loadingMore,
      playlistsPage.error,
      playlistsPage.hasMore,
      playlistsPage.items,
      playlistsPage.loadMore,
      playlistsPage.loading,
      playlistsPage.loadingMore,
      progressByPlaylistId,
      progressError,
      progressLoading,
      quizzesPage.error,
      quizzesPage.hasMore,
      quizzesPage.items,
      quizzesPage.loadMore,
      quizzesPage.loading,
      quizzesPage.loadingMore,
      readsLoading,
      refresh,
      refreshing,
      unreadCount,
    ],
  );

  return <HomeFeedContext.Provider value={value}>{children}</HomeFeedContext.Provider>;
}

/**
 * Previously gated HomeFeed listeners to focused routes. Listeners now stay
 * warm for the signed-in session; this remains a no-op for call sites.
 */
export function useHomeFeedFocus() {}

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

export function useHomeFeedQuizCompetitions(): HomeFeedQuizCompetitions {
  const ctx = useHomeFeedOptional();
  return ctx?.quizCompetitions ?? EMPTY_QUIZ_COMPETITIONS;
}

export function useHomeFeedQuizAttempts(): HomeFeedQuizAttempts {
  const ctx = useHomeFeedOptional();
  return ctx?.quizAttempts ?? EMPTY_QUIZ_ATTEMPTS;
}

export function useHomeFeedRefresh(): { refreshing: boolean; refresh: () => void } {
  const ctx = useHomeFeedOptional();
  return {
    refreshing: ctx?.refreshing ?? false,
    refresh: ctx?.refresh ?? (() => {}),
  };
}

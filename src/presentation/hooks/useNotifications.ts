import { useEffect, useMemo, useState } from 'react';

import { useHomeFeedNotifications } from '../context/HomeFeedContext';
import { subscribeNotifications } from '../../services/firebase/notificationsService';
import type { AppNotification } from '../../store/content/types/notifications.types';
import { getErrorMessage } from '../../utils/firebase/errors';

type UseNotificationsOptions = {
  /** When true, includes draft (unpublished) notifications — for admin screens. */
  includeUnpublished?: boolean;
};

export function useNotifications(options?: UseNotificationsOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const homeFeed = useHomeFeedNotifications();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!includeUnpublished) {
      return;
    }

    const unsub = subscribeNotifications(
      next => {
        setNotifications(next);
        setError(null);
        setLoading(false);
      },
      { includeUnpublished },
      err => {
        setError(getErrorMessage(err));
        setLoading(false);
      },
    );

    return () => unsub();
  }, [includeUnpublished]);

  const displayNotifications = useMemo(() => notifications, [notifications]);

  if (!includeUnpublished) {
    return {
      notifications: homeFeed.notifications,
      displayNotifications: homeFeed.displayNotifications,
      loading: homeFeed.loading,
      error: homeFeed.error,
    };
  }

  return {
    notifications,
    displayNotifications,
    loading,
    error,
  };
}

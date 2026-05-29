import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_UPCOMING_EVENTS_SECTION } from '../../constants/upcomingEventsDefaults';
import {
  subscribeUpcomingEvents,
  subscribeUpcomingEventsSection,
} from '../../services/firebase/upcomingEventsService';
import type {
  UpcomingEvent,
  UpcomingEventsSection,
} from '../../store/content/types/upcomingEvents.types';
import { getErrorMessage } from '../../utils/firebase/errors';

type UseUpcomingEventsOptions = {
  /** When true, includes draft (unpublished) events — for admin screens. */
  includeUnpublished?: boolean;
};

export function useUpcomingEvents(options?: UseUpcomingEventsOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const [section, setSection] = useState<UpcomingEventsSection>(
    DEFAULT_UPCOMING_EVENTS_SECTION,
  );
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let sectionReady = false;
    let eventsReady = false;

    const markReady = () => {
      if (sectionReady && eventsReady) {
        setLoading(false);
      }
    };

    const unsubSection = subscribeUpcomingEventsSection(
      nextSection => {
        setSection(nextSection);
        sectionReady = true;
        markReady();
      },
      err => {
        setError(getErrorMessage(err));
        sectionReady = true;
        markReady();
      },
    );

    const unsubEvents = subscribeUpcomingEvents(
      nextEvents => {
        setEvents(nextEvents);
        setError(null);
        eventsReady = true;
        markReady();
      },
      { includeUnpublished },
      err => {
        setError(getErrorMessage(err));
        eventsReady = true;
        markReady();
      },
    );

    return () => {
      unsubSection();
      unsubEvents();
    };
  }, [includeUnpublished]);

  const displayEvents = useMemo(() => events, [events]);

  return {
    section,
    events,
    displayEvents,
    loading,
    error,
  };
}

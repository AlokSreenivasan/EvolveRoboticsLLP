import { useCallback, useEffect, useMemo, useState } from 'react';

import { firstNameFromDisplayName } from '../../domain/Profile/birthdayWish';
import { isProfileComplete } from '../../domain/Profile/validation/isProfileComplete';
import {
  getAcknowledgedLearnerLevel,
  markAcknowledgedLearnerLevel,
} from '../../services/levelAchievementStorage';
import { getLearnerRank } from '../../utils/gamification/learnerRank';
import { useAuth } from '../context/AuthContext';
import { useUserStreakStats } from './useUserStreakStats';

export function useLevelAchievement() {
  const { user, profile, displayName, profileLoading } = useAuth();
  const { stats, loading: statsLoading } = useUserStreakStats();
  const [acknowledgedLevel, setAcknowledgedLevel] = useState<number | null>(
    null,
  );
  const [hydrated, setHydrated] = useState(false);
  const [visible, setVisible] = useState(false);

  const firstName = useMemo(
    () => firstNameFromDisplayName(displayName),
    [displayName],
  );
  const rank = useMemo(() => getLearnerRank(stats.level), [stats.level]);

  useEffect(() => {
    if (profileLoading || !user?.uid) {
      setHydrated(false);
      setAcknowledgedLevel(null);
      setVisible(false);
      return;
    }

    let cancelled = false;
    getAcknowledgedLearnerLevel(user.uid)
      .then(level => {
        if (!cancelled) {
          setAcknowledgedLevel(level);
          setHydrated(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAcknowledgedLevel(null);
          setHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profileLoading, user?.uid]);

  useEffect(() => {
    if (!hydrated || statsLoading || !user?.uid) {
      return;
    }

    if (acknowledgedLevel == null) {
      setAcknowledgedLevel(stats.level);
      void markAcknowledgedLearnerLevel(user.uid, stats.level);
      return;
    }

    if (
      stats.level > acknowledgedLevel &&
      isProfileComplete(profile)
    ) {
      setVisible(true);
    }
  }, [
    acknowledgedLevel,
    hydrated,
    profile,
    stats.level,
    statsLoading,
    user?.uid,
  ]);

  const dismiss = useCallback(async () => {
    setVisible(false);
    if (!user?.uid) {
      return;
    }
    await markAcknowledgedLearnerLevel(user.uid, stats.level);
    setAcknowledgedLevel(stats.level);
  }, [stats.level, user?.uid]);

  return {
    visible,
    level: stats.level,
    rank,
    firstName,
    dismiss,
  };
}

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ageOnDate,
  firstNameFromDisplayName,
  isBirthdayToday,
} from '../../domain/Profile/birthdayWish';
import { isProfileComplete } from '../../domain/Profile/validation/isProfileComplete';
import {
  getBirthdayWishShownYear,
  markBirthdayWishShown,
} from '../../services/birthdayWishStorage';
import { useAuth } from '../context/AuthContext';

export function useBirthdayWish() {
  const { user, profile, displayName, profileLoading } = useAuth();
  const [visible, setVisible] = useState(false);

  const isBirthday = useMemo(
    () => isBirthdayToday(profile?.dateOfBirth),
    [profile?.dateOfBirth],
  );

  const firstName = useMemo(
    () => firstNameFromDisplayName(displayName),
    [displayName],
  );

  const age = useMemo(
    () => ageOnDate(profile?.dateOfBirth),
    [profile?.dateOfBirth],
  );

  useEffect(() => {
    if (
      profileLoading ||
      !user?.uid ||
      !isBirthday ||
      !isProfileComplete(profile)
    ) {
      setVisible(false);
      return;
    }

    let cancelled = false;
    const year = new Date().getFullYear();

    getBirthdayWishShownYear(user.uid)
      .then(shownYear => {
        if (!cancelled) {
          setVisible(shownYear !== year);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVisible(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isBirthday, profile, profileLoading, user?.uid]);

  const dismiss = useCallback(async () => {
    setVisible(false);
    if (!user?.uid) {
      return;
    }
    await markBirthdayWishShown(user.uid, new Date().getFullYear());
  }, [user?.uid]);

  return { visible, isBirthday, firstName, age, dismiss };
}

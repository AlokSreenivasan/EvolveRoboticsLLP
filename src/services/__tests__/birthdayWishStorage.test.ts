import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getBirthdayWishShownYear,
  markBirthdayWishShown,
} from '../birthdayWishStorage';

describe('birthdayWishStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns null when the wish has not been shown', async () => {
    await expect(getBirthdayWishShownYear('user-1')).resolves.toBeNull();
  });

  it('persists the calendar year the wish was dismissed', async () => {
    await markBirthdayWishShown('user-1', 2026);
    await expect(getBirthdayWishShownYear('user-1')).resolves.toBe(2026);
    await expect(getBirthdayWishShownYear('user-2')).resolves.toBeNull();
  });
});

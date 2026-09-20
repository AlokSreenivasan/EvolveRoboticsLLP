import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getAcknowledgedLearnerLevel,
  markAcknowledgedLearnerLevel,
} from '../levelAchievementStorage';

describe('levelAchievementStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns null when no level has been acknowledged', async () => {
    await expect(getAcknowledgedLearnerLevel('user-1')).resolves.toBeNull();
  });

  it('persists the last acknowledged level per user', async () => {
    await markAcknowledgedLearnerLevel('user-1', 4);
    await expect(getAcknowledgedLearnerLevel('user-1')).resolves.toBe(4);
    await expect(getAcknowledgedLearnerLevel('user-2')).resolves.toBeNull();
  });

  it('ignores invalid levels', async () => {
    await markAcknowledgedLearnerLevel('user-1', 0);
    await markAcknowledgedLearnerLevel('user-1', 2.5);
    await expect(getAcknowledgedLearnerLevel('user-1')).resolves.toBeNull();
  });
});

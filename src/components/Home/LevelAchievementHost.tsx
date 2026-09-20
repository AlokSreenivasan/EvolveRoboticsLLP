import React from 'react';

import { useLevelAchievement } from '../../presentation/hooks/useLevelAchievement';
import LevelAchievementBanner from './LevelAchievementBanner';

function LevelAchievementHost() {
  const { visible, level, rank, firstName, dismiss } = useLevelAchievement();

  return (
    <LevelAchievementBanner
      visible={visible}
      level={level}
      rank={rank}
      firstName={firstName}
      onClose={dismiss}
    />
  );
}

export default LevelAchievementHost;

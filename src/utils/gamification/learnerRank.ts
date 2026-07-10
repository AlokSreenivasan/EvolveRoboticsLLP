export function getLearnerRank(level: number): string {
  if (level <= 1) {
    return 'Explorer';
  }
  if (level <= 3) {
    return 'Builder';
  }
  if (level <= 5) {
    return 'Innovator';
  }
  if (level <= 8) {
    return 'Roboticist';
  }
  return 'Master';
}

export function getLearnerMotivation(
  level: number,
  currentXp: number,
  xpLevelSize: number,
): string {
  if (level === 1 && currentXp < xpLevelSize * 0.2) {
    return 'Your robotics journey starts here.';
  }
  if (currentXp >= xpLevelSize * 0.85) {
    return 'Almost there — finish this level strong!';
  }
  if (currentXp >= xpLevelSize * 0.5) {
    return 'Great momentum. Keep building your skills.';
  }
  return 'Stay consistent and level up your craft.';
}

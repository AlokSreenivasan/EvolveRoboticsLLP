export function getLearnerRank(level: number): string {
  if (level <= 3) {
    return 'Explorer';
  }
  if (level <= 7) {
    return 'Builder';
  }
  if (level <= 12) {
    return 'Innovator';
  }
  if (level <= 18) {
    return 'Roboticist';
  }
  if (level <= 23) {
    return 'Master';
  }
  return 'Pioneer';
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

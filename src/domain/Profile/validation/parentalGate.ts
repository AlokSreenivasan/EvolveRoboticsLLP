export type ParentalGateChallenge = {
  left: number;
  right: number;
};

export function createParentalGateChallenge(
  random: () => number = Math.random,
): ParentalGateChallenge {
  const left = 11 + Math.floor(random() * 19);
  const right = 6 + Math.floor(random() * 14);
  return { left, right };
}

export function parentalGatePrompt(challenge: ParentalGateChallenge): string {
  return `${challenge.left} + ${challenge.right}`;
}

export function parentalGateExpectedAnswer(
  challenge: ParentalGateChallenge,
): number {
  return challenge.left + challenge.right;
}

export function verifyParentalGateAnswer(
  challenge: ParentalGateChallenge,
  answer: string,
): boolean {
  const trimmed = answer.trim();
  if (!/^\d{1,3}$/.test(trimmed)) {
    return false;
  }
  return Number.parseInt(trimmed, 10) === parentalGateExpectedAnswer(challenge);
}

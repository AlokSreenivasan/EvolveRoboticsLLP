import {
  createParentalGateChallenge,
  parentalGateExpectedAnswer,
  parentalGatePrompt,
  verifyParentalGateAnswer,
} from '../parentalGate';

describe('parentalGate', () => {
  it('builds a two-operand addition challenge', () => {
    const challenge = createParentalGateChallenge(() => 0);
    expect(challenge).toEqual({ left: 11, right: 6 });
    expect(parentalGatePrompt(challenge)).toBe('11 + 6');
    expect(parentalGateExpectedAnswer(challenge)).toBe(17);
  });

  it('accepts only the exact integer answer', () => {
    const challenge = { left: 12, right: 9 };
    expect(verifyParentalGateAnswer(challenge, '21')).toBe(true);
    expect(verifyParentalGateAnswer(challenge, ' 21 ')).toBe(true);
    expect(verifyParentalGateAnswer(challenge, '20')).toBe(false);
    expect(verifyParentalGateAnswer(challenge, '')).toBe(false);
    expect(verifyParentalGateAnswer(challenge, '21.0')).toBe(false);
  });
});

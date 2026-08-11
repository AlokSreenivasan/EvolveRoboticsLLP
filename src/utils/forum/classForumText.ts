const MAX_MESSAGE_LENGTH = 1000;
const MAX_REPORT_REASON_LENGTH = 300;

/** Light client-side filter — server rules still enforce length/auth. */
const BLOCKED_PATTERNS: RegExp[] = [/\b(kill\s+yourself|kys)\b/i];

export function normalizeForumMessageText(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim();
}

export function validateForumMessageText(raw: string): string | null {
  const text = normalizeForumMessageText(raw);
  if (!text) {
    return 'Type a message before sending.';
  }
  if (text.length > MAX_MESSAGE_LENGTH) {
    return `Messages can be at most ${MAX_MESSAGE_LENGTH} characters.`;
  }
  if (BLOCKED_PATTERNS.some(pattern => pattern.test(text))) {
    return 'That message can’t be sent. Please keep it respectful and link-free.';
  }
  return null;
}

export function normalizeForumReportReason(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, MAX_REPORT_REASON_LENGTH);
}

export {
  MAX_MESSAGE_LENGTH,
  MAX_REPORT_REASON_LENGTH,
};

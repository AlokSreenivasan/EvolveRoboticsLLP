const SEARCH_MIN_LENGTH = 2;
const PHONE_SEARCH_MIN_DIGITS = 3;

export type AdminUserSearchMode = 'browse' | 'name' | 'email' | 'phone';

/** Title-case prefix to align with how names are stored at sign-up. */
export function formatNameSearchPrefix(term: string): string {
  return term
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(
      word =>
        word.length > 0
          ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          : '',
    )
    .join(' ');
}

function digitsOnly(term: string): string {
  return term.replace(/\D/g, '');
}

function isPhoneSearch(term: string): boolean {
  const digits = digitsOnly(term);
  return (
    digits.length >= PHONE_SEARCH_MIN_DIGITS &&
    digits.length === term.replace(/\s/g, '').length
  );
}

function isEmailSearch(term: string): boolean {
  if (term.includes('@')) {
    return true;
  }
  // Partial email while typing (e.g. john.doe) without requiring @ yet.
  return /\./.test(term) && !/\s/.test(term) && term.length >= SEARCH_MIN_LENGTH;
}

export function resolveAdminUserSearchMode(term: string): AdminUserSearchMode {
  const trimmed = term.trim();
  if (trimmed.length < SEARCH_MIN_LENGTH) {
    return 'browse';
  }
  if (isPhoneSearch(trimmed)) {
    return 'phone';
  }
  if (isEmailSearch(trimmed)) {
    return 'email';
  }
  return 'name';
}

export function normalizeAdminUserSearchTerm(
  term: string,
  mode: AdminUserSearchMode,
): string {
  const trimmed = term.trim();
  switch (mode) {
    case 'email':
      return trimmed.toLowerCase();
    case 'phone':
      return digitsOnly(trimmed);
    case 'name':
      return formatNameSearchPrefix(trimmed);
    default:
      return trimmed;
  }
}

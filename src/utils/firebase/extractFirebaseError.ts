export type FirebaseErrorDetails = {
  /** e.g. firestore/permission-denied, auth/requires-recent-login */
  code?: string;
  message?: string;
  nativeErrorCode?: string;
};

type ErrorLike = {
  code?: string;
  message?: string;
  nativeErrorCode?: string;
  cause?: unknown;
};

function readErrorLike(error: unknown): ErrorLike | null {
  if (!error || typeof error !== 'object') {
    return null;
  }
  return error as ErrorLike;
}

/**
 * Normalizes Firebase/RNFirebase error shapes for logging and user-facing mapping.
 */
export function extractFirebaseErrorDetails(
  error: unknown,
): FirebaseErrorDetails {
  const primary = readErrorLike(error);
  const nested = readErrorLike(primary?.cause);

  const code = primary?.code ?? nested?.code;
  const message = primary?.message ?? nested?.message;
  const nativeErrorCode =
    primary?.nativeErrorCode ?? nested?.nativeErrorCode ?? code;

  return {
    code,
    message,
    nativeErrorCode,
  };
}

/** Returns the short code segment (e.g. permission-denied). */
export function normalizeFirebaseErrorCode(code?: string): string | undefined {
  if (!code) {
    return undefined;
  }
  const slashIndex = code.lastIndexOf('/');
  return slashIndex >= 0 ? code.slice(slashIndex + 1) : code;
}

export function isFirebaseNotFoundError(code?: string): boolean {
  return normalizeFirebaseErrorCode(code) === 'not-found';
}

export function logFirebaseOperationError(
  scope: string,
  stage: string,
  error: unknown,
): void {
  if (!__DEV__) {
    return;
  }

  const details = extractFirebaseErrorDetails(error);
  console.warn(`[${scope}] ${stage} failed`, {
    code: details.code,
    nativeErrorCode: details.nativeErrorCode,
    message: details.message,
  });
}

export type FirebaseServiceErrorCode =
  | 'NOT_AUTHENTICATED'
  | 'PROFILE_NOT_FOUND'
  | 'UPLOAD_FAILED'
  | 'FIRESTORE_ERROR'
  | 'STORAGE_ERROR'
  | 'UNKNOWN';

export class FirebaseServiceError extends Error {
  readonly code: FirebaseServiceErrorCode;
  readonly cause?: unknown;

  constructor(
    code: FirebaseServiceErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message);
    this.name = 'FirebaseServiceError';
    this.code = code;
    this.cause = cause;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof FirebaseServiceError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export function wrapFirebaseError(
  error: unknown,
  code: FirebaseServiceErrorCode,
  fallbackMessage: string,
): FirebaseServiceError {
  if (error instanceof FirebaseServiceError) {
    return error;
  }
  const message =
    error instanceof Error && error.message ? error.message : fallbackMessage;
  return new FirebaseServiceError(code, message, error);
}

export type FirebaseServiceErrorCode =
  | 'NOT_AUTHENTICATED'
  | 'PROFILE_NOT_FOUND'
  | 'UPLOAD_FAILED'
  | 'FIRESTORE_ERROR'
  | 'STORAGE_ERROR'
  | 'LIVE_NOTIFICATION_ERROR'
  | 'PUSH_REGISTRATION_ERROR'
  | 'PUSH_UNREGISTRATION_ERROR'
  | 'NOTIFICATION_PREFERENCES_SYNC_ERROR'
  | 'VALIDATION_ERROR'
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

function getCallableErrorMessage(error: unknown): string | null {
  if (typeof error !== 'object' || error == null) {
    return null;
  }
  const record = error as { message?: string; details?: unknown };
  if (typeof record.message === 'string' && record.message.trim()) {
    return record.message;
  }
  if (typeof record.details === 'string' && record.details.trim()) {
    return record.details;
  }
  return null;
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }
  if (error instanceof FirebaseServiceError) {
    return error.message;
  }
  const callableMessage = getCallableErrorMessage(error);
  if (callableMessage) {
    return callableMessage;
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
  const callableMessage = getCallableErrorMessage(error);
  const message =
    callableMessage ??
    (error instanceof Error && error.message ? error.message : fallbackMessage);
  return new FirebaseServiceError(code, message, error);
}

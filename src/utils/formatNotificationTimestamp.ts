import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

function toDate(
  value: FirebaseFirestoreTypes.Timestamp | null | undefined,
): Date | null {
  if (!value || typeof value.toDate !== 'function') {
    return null;
  }
  return value.toDate();
}

export function formatNotificationTimestamp(
  createdAt: FirebaseFirestoreTypes.Timestamp | null,
  updatedAt: FirebaseFirestoreTypes.Timestamp | null,
): string | null {
  const date = toDate(updatedAt) ?? toDate(createdAt);
  if (!date) {
    return null;
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

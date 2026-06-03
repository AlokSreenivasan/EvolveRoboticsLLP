import { getFunctions, httpsCallable } from '@react-native-firebase/functions';

import type { SendLiveNotificationResult } from '../../store/content/types/notifications.types';
import { wrapFirebaseError } from '../../utils/firebase/errors';

type SendLiveNotificationInput = {
  notificationId: string;
  title: string;
  body: string;
};

export async function sendLiveNotificationToUsers(
  input: SendLiveNotificationInput,
): Promise<SendLiveNotificationResult> {
  try {
    const callable = httpsCallable<
      SendLiveNotificationInput,
      SendLiveNotificationResult
    >(getFunctions(), 'sendLiveNotification');

    const response = await callable({
      notificationId: input.notificationId.trim(),
      title: input.title.trim(),
      body: input.body.trim(),
    });

    const data = response.data;
    return {
      successCount: data?.successCount ?? 0,
      failureCount: data?.failureCount ?? 0,
      recipientCount: data?.recipientCount ?? 0,
    };
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'LIVE_NOTIFICATION_ERROR',
      'Failed to send live notification.',
    );
  }
}

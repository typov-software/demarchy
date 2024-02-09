import type { NotificationProps } from '$lib/models/notifications';
import { FieldValue, type WriteBatch } from 'firebase-admin/firestore';
import { adminInboxRef, adminNotificationRef, createdTimestamps, updatedTimestamps } from './admin';

export function prepareNotification(
  notificationProps: NotificationProps<unknown>,
  userId: string,
  batch: WriteBatch
): WriteBatch {
  batch.create(adminNotificationRef(userId).doc(), {
    ...createdTimestamps(),
    ...notificationProps
  });
  batch.set(
    adminInboxRef().doc(userId),
    {
      ...updatedTimestamps(),
      [notificationProps.category]: FieldValue.increment(1),
      unread: FieldValue.increment(1)
    },
    {
      merge: true
    }
  );
  return batch;
}

import type { ApplicationProps } from '$lib/models/applications';
import { FieldValue } from 'firebase-admin/firestore';
import {
  adminDB,
  adminGroupRef,
  adminInboxRef,
  adminNotificationRef,
  createdTimestamps,
  updatedTimestamps
} from './admin';
import type { ApplicationNotificationData, NotificationProps } from '$lib/models/notifications';

interface SubmitApplicationParams {
  user_id: string;
  profile_handle: string;

  organization_id: string;
  group_id: string;

  text: string;
}

export async function submitApplication(params: SubmitApplicationParams) {
  const { user_id, profile_handle, organization_id, group_id, text } = params;
  const applicationProps: ApplicationProps = {
    user_id,
    profile_handle,
    organization_id,
    group_id,
    text
  };

  const applicationRef = adminGroupRef(organization_id)
    .doc(group_id)
    .collection('applications')
    .doc(user_id);

  const batch = adminDB.batch();
  // create the application
  batch.set(applicationRef, {
    ...createdTimestamps(),
    ...applicationProps
  });

  const notificationData: ApplicationNotificationData = { text };
  const notificationProps: NotificationProps = {
    type: 'application',
    seen: 0,
    data: notificationData
  };
  // create the notifcation
  batch.create(adminNotificationRef(user_id).doc(), {
    ...createdTimestamps(),
    ...notificationProps
  });
  // increment unread count
  batch.set(
    adminInboxRef().doc(user_id),
    {
      ...updatedTimestamps(),
      unread: FieldValue.increment(1)
    },
    {
      merge: true
    }
  );
  try {
    await batch.commit();
  } catch (e) {
    console.error(e);
  }
}

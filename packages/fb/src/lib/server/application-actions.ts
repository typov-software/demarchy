import type { ApplicationProps } from "$lib/models/applications";
import { adminDB, adminGroupRef, createdTimestamps } from "./admin";
import type { ApplicationNotificationData, NotificationProps } from "$lib/models/notifications";
import { prepareNotification } from "./notification-actions";

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
  const notificationData: ApplicationNotificationData = { text };
  const notificationProps: NotificationProps = {
    category: "applications",
    type: "application",
    seen: 0,
    data: notificationData
  };

  const batch = adminDB.batch();
  // create the application
  const applicationRef = adminGroupRef(organization_id)
    .doc(group_id)
    .collection("applications")
    .doc(user_id);
  batch.set(applicationRef, {
    ...createdTimestamps(),
    ...applicationProps
  });
  prepareNotification(notificationProps, user_id, batch);
  try {
    await batch.commit();
  } catch (e) {
    console.error(e);
  }
}

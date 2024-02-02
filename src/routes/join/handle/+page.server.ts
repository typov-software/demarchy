import type { Actions } from '@sveltejs/kit';
import {
  adminDB,
  adminHandleRef,
  adminInboxRef,
  adminNotificationRef,
  adminProfileRef,
  createdTimestamps,
  updatedTimestamps
} from '$lib/server/admin';
import { MEMBERS } from '$lib/models/firestore';
import type { InboxProps } from '$lib/models/inboxes';
import type { ProfileProps } from '$lib/models/profiles';
import type { NotificationProps, WelcomeNotificationData } from '$lib/models/notifications';

export const actions = {
  updateHandle: async ({ request, locals }) => {
    const user_id = locals.user_id!;
    const formData = await request.formData();
    const handle = formData.get('handle') as string;

    // find all member docs and update name
    const memberDocs = await adminDB.collectionGroup(MEMBERS).where('user_id', '==', user_id).get();
    // Get previous handle records for deletion (should only have 1 but this is a precaution)
    const previousHandles = await adminHandleRef().where('user_id', '==', user_id).get();
    const newUser = previousHandles.docs.length === 0;

    const batch = adminDB.batch();
    batch.create(adminHandleRef().doc(handle), {
      ...createdTimestamps(),
      user_id
    });

    if (newUser) {
      // Bootstrap user documents
      const profileProps: ProfileProps = {
        handle,
        name: handle
      };
      batch.create(adminProfileRef().doc(user_id), {
        ...createdTimestamps(),
        ...profileProps
      });
      const inboxRef = adminInboxRef().doc(user_id);
      const inboxProps: InboxProps = {
        unread: 1
      };
      batch.create(inboxRef, {
        ...createdTimestamps(),
        ...inboxProps
      });
      const welcomeRef = adminNotificationRef(inboxRef.id).doc();
      const welcomeNotification: NotificationProps<WelcomeNotificationData> = {
        seen: 0,
        type: 'welcome',
        data: {
          profile_handle: handle
        }
      };
      batch.create(welcomeRef, {
        ...createdTimestamps(),
        ...welcomeNotification
      });
    } else {
      const profileProps: Partial<ProfileProps> = {
        handle
      };
      batch.set(
        adminProfileRef().doc(user_id),
        {
          ...updatedTimestamps(),
          ...profileProps
        },
        { merge: true }
      );
      previousHandles.docs.forEach((doc) => batch.delete(doc.ref));
    }

    memberDocs.docs.forEach((doc) => batch.update(doc.ref, { handle }));

    await batch.commit();
  }
} satisfies Actions;

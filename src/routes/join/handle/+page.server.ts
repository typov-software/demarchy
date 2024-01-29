import type { Actions } from '@sveltejs/kit';
import {
  adminDB,
  adminHandleRef,
  adminInboxRef,
  adminProfileRef,
  createdTimestamps
} from '$lib/server/admin';
import { MEMBERS } from '$lib/models/firestore';
import type { InboxProps } from '$lib/models/inboxes';

export const actions = {
  updateHandle: async ({ request, locals }) => {
    const user_id = locals.user_id!;
    const formData = await request.formData();
    const handle = formData.get('handle') as string;

    // find all member docs and update name
    const memberDocs = await adminDB.collectionGroup(MEMBERS).where('user_id', '==', user_id).get();
    // Get previous handle records for deletion (should only have 1 but this is a precaution)
    const previousHandles = await adminHandleRef().where('user_id', '==', user_id).get();

    const batch = adminDB.batch();
    batch.create(adminHandleRef().doc(handle), { user_id });

    if (previousHandles.docs.length) {
      previousHandles.docs.forEach((doc) => batch.delete(doc.ref));
    } else {
      // Brand new user, create their inbox
      const inboxRef = adminInboxRef().doc(user_id);
      const inboxProps: InboxProps = {
        unread: 0
      };
      batch.set(inboxRef, {
        ...createdTimestamps(),
        ...inboxProps
      });
    }
    batch.set(adminProfileRef().doc(user_id), { handle }, { merge: true });

    memberDocs.docs.forEach((doc) => batch.update(doc.ref, { handle }));

    await batch.commit();
  }
} satisfies Actions;

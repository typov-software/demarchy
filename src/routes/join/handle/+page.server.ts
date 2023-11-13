import type { Actions } from '@sveltejs/kit';
import { adminDB, adminHandleRef, adminProfileRef } from '$lib/server/admin';
import { MEMBERS } from '$lib/models/firestore';

export const actions = {
  updateHandle: async ({ request, locals }) => {
    const uid = locals.user_id!;
    const formData = await request.formData();
    const handle = formData.get('handle') as string;

    // find all member docs and update name
    const memberDocs = await adminDB.collectionGroup(MEMBERS).where('uid', '==', uid).get();
    // Get previous handle records for deletion (should only have 1 but this is a precaution)
    const previousHandles = await adminHandleRef().where('uid', '==', uid).get();

    const batch = adminDB.batch();
    batch.create(adminHandleRef().doc(handle), { uid });
    previousHandles.docs.forEach((doc) => batch.delete(doc.ref));
    batch.set(adminProfileRef().doc(uid), { handle }, { merge: true });
    memberDocs.docs.forEach((doc) => batch.update(doc.ref, { handle }));
    await batch.commit();
  }
} satisfies Actions;

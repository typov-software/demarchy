import type { Actions } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';

export const actions = {
  updateName: async ({ request, locals }) => {
    const uid = locals.user_id!;
    const formData = await request.formData();
    const name = formData.get('name') as string;

    // find all member docs and update name
    const snapshot = await adminDB.collectionGroup('members').where('uid', '==', uid).get();
    const memberRefs = snapshot.docs.map((doc) => doc.ref);

    const batch = adminDB.batch();
    batch.update(adminDB.collection('profiles').doc(uid), { name });
    memberRefs.forEach((ref) => batch.update(ref, { name }));
    await batch.commit();
  },
  updateHandle: async ({ request, locals }) => {
    const uid = locals.user_id!;
    const formData = await request.formData();
    const handle = formData.get('handle') as string;

    // find all member docs and update name
    const memberDocs = await adminDB.collectionGroup('members').where('uid', '==', uid).get();
    // Get previous handle records for deletion (should only have 1 but this is a precaution)
    const previousHandles = await adminDB.collection('handles').where('uid', '==', uid).get();

    const batch = adminDB.batch();
    batch.create(adminDB.collection('handles').doc(handle), { uid });
    previousHandles.docs.forEach((doc) => batch.delete(doc.ref));
    batch.update(adminDB.collection('profiles').doc(uid), { handle });
    memberDocs.docs.forEach((doc) => batch.update(doc.ref, { handle }));
    await batch.commit();
  }
} satisfies Actions;

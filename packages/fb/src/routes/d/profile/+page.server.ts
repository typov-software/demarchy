import type { Actions } from "@sveltejs/kit";
import { adminDB, adminHandleRef, adminProfileRef } from "$lib/server/admin";
import { MEMBERS } from "$lib/models/firestore";

export const actions = {
  updateName: async ({ request, locals }) => {
    const user_id = locals.user_id!;
    const formData = await request.formData();
    const name = formData.get("name") as string;

    // find all member docs and update name
    const snapshot = await adminDB.collectionGroup(MEMBERS).where("user_id", "==", user_id).get();
    const memberRefs = snapshot.docs.map((doc) => doc.ref);

    const batch = adminDB.batch();
    batch.update(adminProfileRef().doc(user_id), { name });
    memberRefs.forEach((ref) => batch.update(ref, { name }));
    await batch.commit();
  },
  updateHandle: async ({ request, locals }) => {
    const user_id = locals.user_id!;
    const formData = await request.formData();
    const handle = formData.get("handle") as string;

    // find all member docs and update name
    const memberDocs = await adminDB.collectionGroup(MEMBERS).where("user_id", "==", user_id).get();
    // Get previous handle records for deletion (should only have 1 but this is a precaution)
    const previousHandles = await adminHandleRef().where("user_id", "==", user_id).get();

    const batch = adminDB.batch();
    batch.create(adminHandleRef().doc(handle), { user_id });
    previousHandles.docs.forEach((doc) => batch.delete(doc.ref));
    batch.update(adminProfileRef().doc(user_id), { handle });
    memberDocs.docs.forEach((doc) => batch.update(doc.ref, { handle }));
    await batch.commit();
  }
} satisfies Actions;

import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminDB } from '$lib/server/admin';

// map to sanitize user input
const types = {
  devlog: 'devlog_subscriptions',
};

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  unsubscribe: async ({ request }) => {
    const formData = await request.formData();
    const list = formData.get('list') as keyof typeof types;
    const email = formData.get('email') as string;
    // only query allowed collections
    const collection = types[list];
    if (!collection) return;
    const snapshot = await adminDB.collection(collection).where('email', '==', email).get();
    if (snapshot.empty) return;
    const batch = adminDB.batch();
    // it should only be one doc, but we get an array back from firestore queries
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
    }
    await batch.commit();
  },
} satisfies Actions;

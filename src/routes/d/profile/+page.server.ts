import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminDB } from '$lib/server/admin';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  updateName: async ({ request, locals }) => {
    const uid = locals.user_id!;
    const formData = await request.formData();
    const name = formData.get('name') as string;
    await adminDB.collection('profiles').doc(uid).update({ name });
  },
  updateHandle: async ({ request }) => {
    const formData = await request.formData();
    return {};
  }
} satisfies Actions;

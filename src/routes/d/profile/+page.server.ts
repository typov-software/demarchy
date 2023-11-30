import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  updateHandle: async ({ request }) => {
    const formData = await request.formData();
    return {};
  }
} satisfies Actions;

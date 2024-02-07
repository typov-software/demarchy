import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { submitApplication } from '$lib/server/application-actions';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  submitApplication: async ({ request, locals }) => {
    const user_id = locals.user_id!;
    const formData = await request.formData();
    const profile_handle = formData.get('profile_handle') as string;
    const organization_id = formData.get('organization_id') as string;
    const group_id = formData.get('group_id') as string;
    const text = formData.get('text') as string;

    await submitApplication({
      user_id,
      profile_handle,
      organization_id,
      group_id,
      text
    });
  }
} satisfies Actions;

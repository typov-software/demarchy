import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
  redirect(301, url.pathname + '/new');
}) satisfies PageServerLoad;

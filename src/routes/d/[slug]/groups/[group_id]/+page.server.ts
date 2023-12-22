import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ url }) => {
  throw redirect(301, url.pathname + '/access');
}) satisfies PageServerLoad;

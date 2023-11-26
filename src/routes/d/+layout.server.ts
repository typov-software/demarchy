import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals, fetch }) => {
  const uid = locals.user_id;
  if (!uid) {
    throw redirect(301, '/login');
  }

  const res = await fetch('/api/d', { method: 'GET' });
  const data = await res.json();

  return {
    ...data
  };
}) satisfies LayoutServerLoad;

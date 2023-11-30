import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Membership } from '$lib/models/memberships';
import type { Organization } from '$lib/models/organizations';
import type { Profile } from '$lib/models/profiles';

export const load = (async ({ locals, fetch }) => {
  const uid = locals.user_id;
  if (!uid) {
    throw redirect(301, '/login');
  }

  const res = await fetch('/api/d', { method: 'GET' });
  const data = await res.json();

  return {
    memberships: data.memberships as Membership[],
    organizations: data.organizations as Organization[],
    profile: data.profile as Profile
  };
}) satisfies LayoutServerLoad;

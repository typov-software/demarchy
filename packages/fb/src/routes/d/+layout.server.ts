import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Membership } from '$lib/models/memberships';
import type { Organization } from '$lib/models/organizations';
import type { Profile } from '$lib/models/profiles';

export const load = (async ({ locals, fetch }) => {
  const user_id = locals.user_id;
  if (!user_id) {
    redirect(301, '/login?session=expired');
  }

  const res = await fetch('/api/d', { method: 'GET' });
  const data = await res.json();

  return {
    memberships: data.memberships as Membership[],
    organizations: data.organizations as Organization[],
    profile: data.profile as Profile,
  };
}) satisfies LayoutServerLoad;

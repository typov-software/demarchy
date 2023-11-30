import type { Organization } from '$lib/models/organizations';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params, parent }) => {
  const slug = params.slug;
  const { organizations, memberships } = await parent();
  const organization = organizations.find((o: Organization) => o.slug === slug);
  const organization_memberships = memberships.find(
    (membership) => membership.organization_id === organization!.id
  );

  /**
   * This check prevents users from viewing organizations they don't have access to,
   * and applies to all subroutes.
   */
  if (!organization_memberships || !organization) {
    throw error(401, 'unauthorized');
  }

  return {
    slug,
    organization,
    organization_memberships
  };
}) satisfies LayoutServerLoad;

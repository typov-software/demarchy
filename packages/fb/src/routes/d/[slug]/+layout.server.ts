import type { Organization } from '$lib/models/organizations';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { canReadOrg, isGroupMemberOrHigher } from '$lib/server/access';
import { adminGroupRef } from '$lib/server/admin';
import type { Group } from '$lib/models/groups';
import { makeDocument } from '$lib/models/utils';

export const load = (async ({ params, parent, locals }) => {
  const user_id = locals.user_id!;
  const slug = params.slug;
  const { organizations, memberships } = await parent();
  const organization = organizations.find((o: Organization) => o.slug === slug);
  const organization_memberships = memberships.find(
    (membership) => membership.organization_id === organization!.id,
  );
  const allowed = await canReadOrg(organization!.id, user_id, organization_memberships);
  const snapshot = await adminGroupRef(organization!.id).orderBy('name', 'asc').get();
  const groups: Group[] = snapshot.docs.map((doc) => makeDocument(doc));

  const allowed_groups: Group[] = [];
  for (const g of groups) {
    const isMem = await isGroupMemberOrHigher(
      organization!.id,
      g.id,
      user_id,
      organization_memberships,
    );
    if (isMem) {
      allowed_groups.push(g);
    }
  }

  /**
   * This check prevents users from viewing organizations they don't have access to,
   * and applies to all subroutes.
   */
  if (!organization_memberships || !organization || !allowed) {
    error(403, 'forbidden');
  }

  return {
    slug,
    organization,
    organization_memberships,
    groups,
    allowed_groups,
  };
}) satisfies LayoutServerLoad;

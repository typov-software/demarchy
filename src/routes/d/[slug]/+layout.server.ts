import type { Organization } from '$lib/models/organizations';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { canReadOrg } from '$lib/server/access';
import { adminGroupRef } from '$lib/server/admin';
import type { Group, GroupProps } from '$lib/models/groups';
import type { Timestamp } from 'firebase-admin/firestore';

export const load = (async ({ params, parent, locals }) => {
  const uid = locals.user_id!;
  const slug = params.slug;
  const { organizations, memberships } = await parent();
  const organization = organizations.find((o: Organization) => o.slug === slug);
  const organization_memberships = memberships.find(
    (membership) => membership.organization_id === organization!.id
  );
  const allowed = await canReadOrg(organization!.id, uid, organization_memberships);
  const snapshot = await adminGroupRef(organization!.id).orderBy('name', 'asc').get();
  const groups: Group[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as GroupProps),
    created_at: (doc.data()!.created_at as Timestamp).toDate()
  }));

  /**
   * This check prevents users from viewing organizations they don't have access to,
   * and applies to all subroutes.
   */
  if (!organization_memberships || !organization || !allowed) {
    throw error(403, 'forbidden');
  }

  return {
    slug,
    organization,
    organization_memberships,
    groups
  };
}) satisfies LayoutServerLoad;

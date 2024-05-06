import { canReadOrg, isGroupObserverOrHigher } from '$lib/server/access';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { adminDB } from '$lib/server/admin';
import { makeDocument } from '$lib/models/utils';
import { type ProposalSettings } from '$lib/models/settings';

export const load = (async ({ parent, params, locals }) => {
  const { groups, organization, organization_memberships } = await parent();

  const group = groups.find((ws) => ws.slug === params.group_slug);
  const can_read = await canReadOrg(organization.id, locals.user_id!, organization_memberships);
  const can_write = await isGroupObserverOrHigher(
    organization.id,
    group!.id,
    locals.user_id!,
    organization_memberships,
  );

  if (!can_read || !group) {
    error(403, 'forbidden');
  }

  const proposalSettings = await adminDB
    .doc(group.path)
    .collection('settings')
    .doc('proposals')
    .get();

  const role = organization_memberships.roles[group.id];

  return {
    can_read,
    can_write,
    role,
    group,
    settings: {
      proposals: makeDocument<ProposalSettings>(proposalSettings),
    },
  };
}) satisfies LayoutServerLoad;

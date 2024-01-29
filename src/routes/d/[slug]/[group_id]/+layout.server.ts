import { isGroupObserverOrHigher } from '$lib/server/access';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { adminDB } from '$lib/server/admin';
import { makeDocument } from '$lib/models/utils';
import { type ProposalSettings } from '$lib/models/settings';

export const load = (async ({ parent, params, locals }) => {
  const { groups, organization, organization_memberships } = await parent();

  const allowed = await isGroupObserverOrHigher(
    organization.id,
    params.group_id,
    locals.user_id!,
    organization_memberships
  );

  const group = groups.find((ws) => ws.id === params.group_id);

  if (!allowed || !group) {
    error(403, 'forbidden');
  }

  const proposalSettings = await adminDB
    .doc(group.path)
    .collection('settings')
    .doc('proposals')
    .get();

  return {
    group,
    settings: {
      proposals: makeDocument<ProposalSettings>(proposalSettings)
    }
  };
}) satisfies LayoutServerLoad;

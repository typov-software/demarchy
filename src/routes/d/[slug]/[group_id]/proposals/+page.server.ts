import { adminGroupProposalRef } from '$lib/server/admin';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Proposal, ProposalProps } from '$lib/models/proposals';

export const load = (async ({ locals, parent }) => {
  const uid = locals.user_id!;

  const data = await parent();
  const groupId = data.group?.id;
  if (!groupId) {
    throw error(403, 'invalid group id');
  }

  // get user draft proposals and open group proposals
  const draftSnap = await adminGroupProposalRef(data.organization.id, groupId)
    .where('created_by', '==', uid)
    .where('state', '==', 'draft')
    .orderBy('created_at', 'desc')
    .get();

  const drafts: Proposal[] = draftSnap.docs.map((doc) => ({
    id: doc.id,
    path: doc.ref.path,
    ...(doc.data() as ProposalProps),
    created_at: doc.data().created_at.toDate()
  }));

  const groupSnap = await adminGroupProposalRef(data.organization.id, groupId)
    .where('state', '==', 'open')
    .orderBy('created_at', 'desc')
    .get();

  const open: Proposal[] = groupSnap.docs.map((doc) => ({
    id: doc.id,
    path: doc.ref.path,
    ...(doc.data() as ProposalProps),
    created_at: doc.data().created_at.toDate()
  }));

  return {
    drafts,
    open
  };
}) satisfies PageServerLoad;

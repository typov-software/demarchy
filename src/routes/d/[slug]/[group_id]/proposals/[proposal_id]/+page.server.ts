import type { Proposal, ProposalProps } from '$lib/models/proposals';
import { adminGroupProposalRef } from '$lib/server/admin';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, parent }) => {
  const data = await parent();
  const proposalId = params.proposal_id;
  const proposalRef = adminGroupProposalRef(data.organization.id, data.group!.id).doc(proposalId);
  const proposalDoc = await proposalRef.get();
  const proposal: Proposal = {
    id: proposalDoc.id,
    path: proposalDoc.ref.path,
    ...(proposalDoc.data() as ProposalProps),
    created_at: proposalDoc.data()?.created_at.toDate()
  };
  return {
    proposal
  };
}) satisfies PageServerLoad;

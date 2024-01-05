import { adminGroupProposalRef, createdTimestamps } from '$lib/server/admin';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Proposal, ProposalProps } from '$lib/models/proposals';
import { makeDocument } from '$lib/models/utils';

export const load = (async ({ locals, parent }) => {
  const uid = locals.user_id!;

  const data = await parent();
  const groupId = data.group?.id;
  if (!groupId) {
    error(403, 'invalid group id');
  }

  // get user draft proposals and open group proposals
  const draftSnap = await adminGroupProposalRef(data.organization.id, groupId)
    .where('user_id', '==', uid)
    .where('state', '==', 'draft')
    .orderBy('updated_at', 'desc')
    .get();

  const drafts: Proposal[] = draftSnap.docs.map((doc) => makeDocument(doc));
  const groupSnap = await adminGroupProposalRef(data.organization.id, groupId)
    .where('state', '==', 'open')
    .orderBy('updated_at', 'desc')
    .get();

  const open: Proposal[] = groupSnap.docs.map((doc) => makeDocument(doc));
  return {
    drafts,
    open
  };
}) satisfies PageServerLoad;

export const actions = {
  createProposal: async ({ request, params, locals }) => {
    const formData = await request.formData();
    const user_id = locals.user_id!;
    const user_handle = formData.get('user_handle') as string;
    const organization_id = formData.get('organization_id') as string;
    const group_id = formData.get('group_id') as string;
    const props: Omit<ProposalProps, 'created_at' | 'updated_at'> = {
      user_id,
      user_handle,
      group_id,
      state: 'draft',
      title: `Unnamed proposal by @${user_handle}`,
      description: '',
      amendments: {},
      links: {}
    };
    const proposalDoc = await adminGroupProposalRef(organization_id, group_id).doc();
    await proposalDoc.set({
      ...createdTimestamps(),
      ...props
    });
    redirect(301, `/d/${params.slug}/${group_id}/proposals/${proposalDoc.id}`);
  }
} satisfies Actions;

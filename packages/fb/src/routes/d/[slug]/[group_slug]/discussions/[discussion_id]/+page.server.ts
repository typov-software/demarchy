import type { Discussion, DiscussionProps } from '$lib/models/discussions';
import { makeDocument } from '$lib/models/utils';
import { adminDB, adminGroupDiscussionRef, updatedTimestamps } from '$lib/server/admin';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { verifyDocument } from '$lib/server/access';
import type { ProposalProps } from '$lib/models/proposals';

export const load = (async ({ params, parent }) => {
  const data = await parent();
  const discussionId = params.discussion_id;
  const discussionRef = adminGroupDiscussionRef(data.organization.id, data.group.id).doc(
    discussionId,
  );
  const discussionDoc = await discussionRef.get();
  const discussion = makeDocument<Discussion>(discussionDoc);
  return {
    discussion,
  };
}) satisfies PageServerLoad;

async function updateDiscussionState(
  discussionPath: string,
  userId: string,
  state: DiscussionProps['state'],
) {
  const discussionDoc = await verifyDocument(discussionPath, userId);
  const batch = adminDB.batch();
  // update proposal state
  const proposalProps: Partial<ProposalProps> = { state };
  batch.update(discussionDoc.ref, {
    ...updatedTimestamps(),
    ...proposalProps,
  });
  await batch.commit();
}

export const actions = {
  openDiscussion: async ({ request, locals }) => {
    const formData = await request.formData();
    const userId = locals.user_id!;
    const discussionPath = formData.get('path') as string;
    await updateDiscussionState(discussionPath, userId, 'open');
  },
  dropDiscussion: async ({ request, params, locals }) => {
    const formData = await request.formData();
    const userId = locals.user_id!;
    const discussionPath = formData.get('path') as string;
    await updateDiscussionState(discussionPath, userId, 'dropped');
    redirect(301, `/d/${params.slug}/${params.group_slug}/discussions`);
  },
} satisfies Actions;

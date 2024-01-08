import type { CommentProps } from '$lib/models/comments';
import { adminGroupFeedbackRef, createdTimestamps } from '$lib/server/admin';
import type { Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { createEmptyReactions, createEmptyReenforcements } from '$lib/models/reactions';

export const actions = {
  createFeedback: async ({ request, locals, url }) => {
    const uid = locals.user_id!;
    const formData = await request.formData();
    const organizationId = formData.get('organization_id') as string;
    const groupId = formData.get('group_id') as string;
    const userHandle = formData.get('user_handle') as string;
    const body = formData.get('body') as string;
    const anonymous = formData.get('anonymous') as string;
    const isAnonymous = anonymous === 'on';

    if (!body) {
      error(403, 'Malformed comment props');
    }

    const feedbackRef = adminGroupFeedbackRef(organizationId, groupId).doc();
    const commentProps: Omit<CommentProps, 'created_at'> = {
      organization_id: organizationId,
      group_id: groupId,
      context: 'feedback',
      context_id: feedbackRef.id,
      body,
      depth: 0,
      parent: null,
      user_id: isAnonymous ? null : uid,
      user_handle: isAnonymous ? null : userHandle,
      seen: 0,
      ...createEmptyReactions(),
      ...createEmptyReenforcements()
    };
    await feedbackRef.set({
      ...createdTimestamps(),
      ...commentProps
    });

    redirect(301, url.pathname);
  }
} satisfies Actions;

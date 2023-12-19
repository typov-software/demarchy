import type { CommentProps } from '$lib/models/comments';
import { adminGroupFeedbackRef } from '$lib/server/admin';
import { FieldValue, type Timestamp } from 'firebase-admin/firestore';
import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ parent }) => {
  const data = await parent();

  const feedbackRef = adminGroupFeedbackRef(data.organization.id, data.group!.id);
  const snapshot = await feedbackRef.orderBy('created_at', 'desc').limit(20).get();
  const comments = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as CommentProps),
    created_at: (doc.data().created_at as Timestamp).toDate()
  }));

  return {
    comments
  };
}) satisfies PageServerLoad;

export const actions = {
  createFeedback: async ({ request, locals, url }) => {
    const uid = locals.user_id!;
    const formData = await request.formData();
    const organizationId = formData.get('organization_id') as string;
    const groupId = formData.get('group_id') as string;
    const body = formData.get('body') as string;

    const feedbackRef = adminGroupFeedbackRef(organizationId, groupId).doc();
    const commentProps: Omit<CommentProps, 'created_at'> = {
      context: 'feedback',
      context_id: feedbackRef.id,
      body,
      depth: 0,
      parent: null,
      user_id: uid
    };
    await feedbackRef.set({
      ...commentProps,
      created_at: FieldValue.serverTimestamp()
    });

    throw redirect(301, url.pathname);
  }
} satisfies Actions;

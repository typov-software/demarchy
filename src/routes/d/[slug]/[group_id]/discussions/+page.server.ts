import type { Discussion } from '$lib/models/discussions';
import { makeDocument } from '$lib/models/utils';
import { adminGroupDiscussionRef } from '$lib/server/admin';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, parent }) => {
  const data = await parent();

  const snapshotUserDrafts = await adminGroupDiscussionRef(data.organization.id, data.group.id)
    .where('user_id', '==', locals.user_id!)
    .where('state', '==', 'draft')
    .orderBy('updated_at', 'desc')
    .get();

  const drafts: Discussion[] = snapshotUserDrafts.docs.map((doc) => makeDocument(doc));

  const snapshotOpenDiscussions = await adminGroupDiscussionRef(data.organization.id, data.group.id)
    .where('state', '==', 'open')
    .orderBy('updated_at', 'desc')
    .get();

  const open: Discussion[] = snapshotOpenDiscussions.docs.map((doc) => makeDocument(doc));

  return {
    drafts,
    open
  };
}) satisfies PageServerLoad;

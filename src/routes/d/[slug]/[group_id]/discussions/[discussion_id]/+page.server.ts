import type { Discussion } from '$lib/models/discussions';
import { makeDocument } from '$lib/models/utils';
import { adminGroupDiscussionRef } from '$lib/server/admin';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, parent }) => {
  const data = await parent();
  const discussionId = params.discussion_id;
  const discussionRef = adminGroupDiscussionRef(data.organization.id, data.group.id).doc(
    discussionId
  );
  const discussionDoc = await discussionRef.get();
  const discussion = makeDocument<Discussion>(discussionDoc);
  return {
    discussion
  };
}) satisfies PageServerLoad;

import type { CommentProps } from '$lib/models/comments';
import { adminGroupRef } from '$lib/server/admin';
import type { Timestamp } from 'firebase-admin/firestore';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
  const data = await parent();

  const feedbackRef = adminGroupRef(data.organization.id)
    .doc(data.group!.id)
    .collection('feedback');

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

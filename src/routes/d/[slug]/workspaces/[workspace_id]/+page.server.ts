import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminMemberRef } from '$lib/server/admin';
import type { Member, MemberProps } from '$lib/models/members';
import type { OrderByDirection, Timestamp } from 'firebase/firestore';

export const load = (async ({ locals, params, url, parent }) => {
  const uid = locals.user_id;
  if (!uid) {
    throw redirect(301, '/login');
  }
  const direction: OrderByDirection = (url.searchParams.get('direction') ??
    'asc') as OrderByDirection;
  const sortField = url.searchParams.get('sortBy') ?? 'name';

  const wid = params.workspace_id;
  const data = await parent();
  const snapshot = await adminMemberRef(data.organization!.id, wid)
    .orderBy(sortField, direction)
    .get();
  const members: Member[] = snapshot.docs.map((doc) => ({
    ...(doc.data() as MemberProps),
    id: doc.id,
    joined_at: (doc.data().joined_at as Timestamp).toDate()
  }));

  return {
    members
  };
}) satisfies PageServerLoad;

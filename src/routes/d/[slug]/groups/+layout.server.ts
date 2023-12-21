import type { LayoutServerLoad } from './$types';
import { adminGroupRef } from '$lib/server/admin';
import type { Group, GroupProps } from '$lib/models/groups';
import type { Timestamp } from 'firebase-admin/firestore';
import { getComparator, stableSort } from '$lib/utils/sorting';

export const load = (async ({ parent }) => {
  const { organization } = await parent();
  // Load all org groups not just groups the user is a member of
  // this way all users can discover other groups and request access (obs, mem)
  const snapshot = await adminGroupRef(organization.id).get();
  const groups: Group[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as GroupProps),
    created_at: (doc.data()!.created_at as Timestamp).toDate()
  }));

  return {
    groups: stableSort(groups, getComparator('asc', 'name'))
  };
}) satisfies LayoutServerLoad;

import type { Actions, PageServerLoad } from './$types';
import { adminDB, adminMemberRef, adminMembershipRef } from '$lib/server/admin';
import type { Member, MemberProps } from '$lib/models/members';
import { error, redirect } from '@sveltejs/kit';
import type { OrderByDirection, Timestamp } from 'firebase-admin/firestore';

export const load = (async ({ params, url, parent }) => {
  const direction: OrderByDirection = (url.searchParams.get('direction') ??
    'asc') as OrderByDirection;
  const sortField = url.searchParams.get('sortBy') ?? 'name';

  const wid = params.group_id;
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

export const actions = {
  /**
   * Form action to leave a group or organization (all org groups)
   */
  leaveGroup: async ({ request, locals, params }) => {
    const uid = locals.user_id!;
    const formData = await request.formData();
    const context = formData.get('context') as 'organization' | 'group';
    const organizationId = formData.get('organization_id') as string;
    const groupId = formData.get('group_id') as string;

    // We need to make sure that this user isn't the only member left of the group
    const membersRef = adminMemberRef(organizationId, groupId);
    const membersSnapshot = await membersRef.limit(2).get();
    if (membersSnapshot.docs.length === 1 && membersSnapshot.docs.at(0)?.id === uid) {
      error(403, 'forbidden');
    }

    const batch = adminDB.batch();

    if (context === 'group') {
      const memberRef = adminMemberRef(organizationId, groupId).doc(uid);
      const membershipRef = adminMembershipRef(organizationId).doc(uid);
      const membershipDoc = await membershipRef.get();
      // Remove this groups role from the user's membership document
      const roles = membershipDoc.data()?.roles ?? {};
      delete roles[groupId];

      batch.update(membershipRef, { roles });
      batch.delete(memberRef);
    } else if (context === 'organization') {
      const membershipRef = adminMembershipRef(organizationId).doc(uid);
      const membershipDoc = await membershipRef.get();
      const roles = membershipDoc.data()?.roles ?? {};
      const ids = Object.keys(roles);

      // Remove all groups this user had access to for this org
      for (const id of ids) {
        const memberRef = adminMemberRef(organizationId, id).doc(uid);
        batch.delete(memberRef);
      }
      // Remove full membership document as is no longer needed
      batch.delete(membershipRef);
    }

    await batch.commit();

    if (context === 'group') {
      redirect(301, `/d/${params.slug}/groups`);
    } else if (context === 'organization') {
      redirect(301, `/d`);
    }
  }
} satisfies Actions;

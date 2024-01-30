import type { Actions, PageServerLoad } from './$types';
import { adminDB, adminGroupRef, adminMemberRef, adminMembershipRef } from '$lib/server/admin';
import type { Member } from '$lib/models/members';
import { error, redirect } from '@sveltejs/kit';
import { FieldValue, type OrderByDirection } from 'firebase-admin/firestore';
import { makeDocument } from '$lib/models/utils';

export const load = (async ({ url, parent }) => {
  const direction: OrderByDirection = (url.searchParams.get('direction') ??
    'asc') as OrderByDirection;
  const sortField = url.searchParams.get('sortBy') ?? 'name';
  const { organization, group } = await parent();
  const snapshot = await adminMemberRef(organization.id, group.id)
    .orderBy(sortField, direction)
    .get();
  const members: Member[] = snapshot.docs.map((doc) => makeDocument(doc));
  return {
    members
  };
}) satisfies PageServerLoad;

export const actions = {
  /**
   * Form action to leave a group or organization (all org groups)
   */
  leaveGroup: async ({ request, locals, params }) => {
    const user_id = locals.user_id!;
    const formData = await request.formData();
    const context = formData.get('context') as 'organization' | 'group';
    const organizationId = formData.get('organization_id') as string;
    const groupId = formData.get('group_id') as string;

    // We need to make sure that this user isn't the only member left of the group
    const membersRef = adminMemberRef(organizationId, groupId);
    const membersSnapshot = await membersRef.limit(2).get();
    if (membersSnapshot.docs.length === 1 && membersSnapshot.docs.at(0)?.id === user_id) {
      error(403, 'forbidden');
    }

    const batch = adminDB.batch();

    if (context === 'group') {
      const memberRef = adminMemberRef(organizationId, groupId).doc(user_id);
      const membershipRef = adminMembershipRef(organizationId).doc(user_id);
      const membershipDoc = await membershipRef.get();
      // Remove this groups role from the user's membership document
      const roles = membershipDoc.data()?.roles ?? {};
      delete roles[groupId];

      batch.update(membershipRef, { roles });
      batch.delete(memberRef);
    } else if (context === 'organization') {
      const membershipRef = adminMembershipRef(organizationId).doc(user_id);
      const membershipDoc = await membershipRef.get();
      const roles = membershipDoc.data()?.roles ?? {};
      const ids = Object.keys(roles);

      // Remove all groups this user had access to for this org
      for (const id of ids) {
        const memberRef = adminMemberRef(organizationId, id).doc(user_id);
        batch.delete(memberRef);
      }
      // Remove full membership document as is no longer needed
      batch.delete(membershipRef);
    }

    const groupRef = adminGroupRef(organizationId).doc(groupId);
    batch.update(groupRef, { member_count: FieldValue.increment(-1) });

    await batch.commit();

    if (context === 'group') {
      redirect(301, `/d/${params.slug}/groups`);
    } else if (context === 'organization') {
      redirect(301, `/d`);
    }
  }
} satisfies Actions;

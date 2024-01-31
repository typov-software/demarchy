import type { Actions, PageServerLoad } from './$types';
import {
  adminDB,
  adminGroupRef,
  adminInboxRef,
  adminInvitationRef,
  adminMemberRef,
  adminMembershipRef,
  adminNotificationRef,
  createdTimestamps,
  updatedTimestamps
} from '$lib/server/admin';
import type { Member } from '$lib/models/members';
import { error, redirect } from '@sveltejs/kit';
import { FieldValue, type OrderByDirection } from 'firebase-admin/firestore';
import { makeDocument } from '$lib/models/utils';
import type { Invitation, InvitationProps } from '$lib/models/invitations';
import type { RoleAccess } from '$lib/models/roles';
import type { NotificationInvitationData, NotificationProps } from '$lib/models/notifications';

export const load = (async ({ url, parent }) => {
  const direction: OrderByDirection = (url.searchParams.get('direction') ??
    'asc') as OrderByDirection;
  const sortField = url.searchParams.get('sortBy') ?? 'handle';
  const { organization, group } = await parent();
  const snapshot = await adminMemberRef(organization.id, group.id)
    .orderBy(sortField, direction)
    .get();
  const invitationsSnapshot = await adminInvitationRef(organization.id)
    .where('group_id', '==', group.id)
    .get();

  const members: Member[] = snapshot.docs.map((doc) => makeDocument(doc));
  const invitations: Invitation[] = invitationsSnapshot.docs.map((doc) => makeDocument(doc));

  return {
    members,
    invitations
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
  },
  invite: async ({ request, url }) => {
    const formData = await request.formData();
    const organization_id = formData.get('organization_id') as string;
    const organization_name = formData.get('organization_name') as string;
    const group_id = formData.get('group_id') as string;
    const group_name = formData.get('group_name') as string;
    const invited_user_id = formData.get('invited_user_id') as string;
    const invited_profile_handle = formData.get('invited_profile_handle') as string;
    const role = (formData.get('role') ?? 'mem') as RoleAccess;
    const user_id = formData.get('user_id') as string;
    const profile_handle = formData.get('profile_handle') as string;
    if (!organization_id || !group_id || !invited_user_id || !role || !user_id || !profile_handle) {
      error(401, 'unauthorized');
    }
    const invitationRef = adminInvitationRef(organization_id).doc();
    const batch = adminDB.batch();
    const invitationProps: InvitationProps = {
      user_id,
      profile_handle,
      invited_profile_handle,
      invited_user_id,
      organization_id,
      group_id,
      role,
      rejected: false
    };
    batch.create(invitationRef, {
      ...createdTimestamps(),
      ...invitationProps
    });
    batch.set(
      adminInboxRef().doc(invited_user_id),
      {
        ...updatedTimestamps(),
        unread: FieldValue.increment(1)
      },
      {
        merge: true
      }
    );
    const inviteData: NotificationInvitationData = {
      invitation_id: invitationRef.id,
      organization_id,
      organization_name,
      group_id,
      group_name,
      invited_by_id: user_id,
      invited_by_handle: profile_handle
    };
    const notificationProps: NotificationProps = {
      type: 'invitation',
      seen: 0,
      data: inviteData
    };
    batch.create(adminNotificationRef(invited_user_id).doc(), {
      ...createdTimestamps(),
      ...notificationProps
    });
    await batch.commit();

    redirect(303, url.pathname);
  },
  uninvite: async ({ request }) => {
    const formData = await request.formData();
    const organization_id = formData.get('organization_id') as string;
    const invitation_id = formData.get('invitation_id') as string;
    await adminInvitationRef(organization_id).doc(invitation_id).delete();
    return {};
  }
} satisfies Actions;

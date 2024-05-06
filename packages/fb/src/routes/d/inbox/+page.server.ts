import {
  adminDB,
  adminGroupRef,
  adminInboxRef,
  adminInvitationRef,
  adminMemberRef,
  adminMembershipRef,
  adminNotificationRef,
  adminOrganizationRef,
  adminProfileRef,
  createdTimestamps,
} from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { PageServerLoad } from './$types';
import { error, type Actions, redirect } from '@sveltejs/kit';
import type { Invitation } from '$lib/models/invitations';
import type { MembershipProps } from '$lib/models/memberships';
import type { MemberProps } from '$lib/models/members';
import type { Profile } from '$lib/models/profiles';
import { makeDocument } from '$lib/models/utils';
import { type Group } from '$lib/models/groups';
import { type Organization } from '$lib/models/organizations';
import { isGroupMemberOrHigher } from '$lib/server/access';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  rejectInvitation: async ({ request, locals }) => {
    const user_id = locals.user_id!;
    const formData = await request.formData();
    const invitation_id = formData.get('invitation_id') as string;
    const organization_id = formData.get('organization_id') as string;
    const notification_id = formData.get('notification_id') as string;

    const inboxRef = adminInboxRef().doc(user_id);
    const notificationRef = adminNotificationRef(user_id).doc(notification_id);

    const batch = adminDB.batch();
    // Invitation may have been removed before chance to reject
    const invitationDoc = await adminInvitationRef(organization_id).doc(invitation_id).get();
    if (invitationDoc.exists) {
      // We want to keep the invitation document around
      batch.update(invitationDoc.ref, { rejected: true });
    }
    batch.update(inboxRef, {
      invitations: FieldValue.increment(-1),
      unread: FieldValue.increment(-1),
    });
    batch.delete(notificationRef);
    await batch.commit();
  },
  acceptInvitation: async ({ request, locals }) => {
    const user_id = locals.user_id!;
    const formData = await request.formData();
    const invitation_id = formData.get('invitation_id') as string;
    const organization_id = formData.get('organization_id') as string;
    const group_id = formData.get('group_id') as string;
    const notification_id = formData.get('notification_id') as string;

    const invitationDoc = await adminInvitationRef(organization_id).doc(invitation_id).get();
    const profileDoc = await adminProfileRef().doc(user_id).get();
    if (!invitationDoc.exists || !profileDoc.exists) {
      error(401, 'unauthorized');
    }

    const isAlreadyMember = await isGroupMemberOrHigher(organization_id, group_id, user_id);
    const groupRef = adminGroupRef(organization_id).doc(group_id);
    const groupDoc = await groupRef.get();
    const orgDoc = await adminOrganizationRef().doc(organization_id).get();
    const inboxRef = adminInboxRef().doc(user_id);
    const notificationRef = adminNotificationRef(user_id).doc(notification_id);

    if (!orgDoc.exists || !groupDoc.exists) {
      error(401, 'unauthorized');
    }

    const group = makeDocument<Group>(groupDoc);
    const organization = makeDocument<Organization>(orgDoc);
    const invitation = makeDocument<Invitation>(invitationDoc);
    const profile = makeDocument<Profile>(profileDoc);

    const redirectTo = `/d/${organization.slug}/${group.slug}`;

    const batch = adminDB.batch();
    if (!isAlreadyMember) {
      const membershipProps: MembershipProps = {
        organization_id,
        user_id: profile.id,
        standing: 'ok',
        roles: {
          [invitation.group_id]: invitation.role,
        },
      };
      batch.set(
        adminMembershipRef(organization_id).doc(invitation.invited_user_id),
        {
          ...createdTimestamps(),
          ...membershipProps,
        },
        {
          merge: true,
        },
      );
      const memberProps: MemberProps = {
        user_id: profile.id,
        name: profile.name,
        handle: profile.handle,
        role: invitation.role,
        group_id: invitation.group_id,
        organization_id: invitation.organization_id,
      };
      batch.set(
        adminMemberRef(organization_id, invitation.group_id).doc(invitation.invited_user_id),
        {
          ...createdTimestamps(),
          ...memberProps,
        },
        { merge: true },
      );
      batch.update(groupRef, { member_count: FieldValue.increment(1) });
    }
    batch.update(inboxRef, {
      invitations: FieldValue.increment(-1),
      unread: FieldValue.increment(-1),
    });
    batch.delete(notificationRef);
    batch.delete(invitationDoc.ref);
    await batch.commit();

    redirect(301, redirectTo);
  },
} satisfies Actions;

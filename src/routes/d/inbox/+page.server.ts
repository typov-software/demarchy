import type { Notification } from '$lib/models/notifications';
import {
  adminDB,
  adminInboxRef,
  adminInvitationRef,
  adminMemberRef,
  adminMembershipRef,
  adminNotificationRef,
  adminProfileRef
} from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { PageServerLoad } from './$types';
import { error, type Actions } from '@sveltejs/kit';
import type { Invitation } from '$lib/models/invitations';
import type { MembershipProps } from '$lib/models/memberships';
import type { MemberProps } from '$lib/models/members';
import type { Profile } from '$lib/models/profiles';
import { makeDocument } from '$lib/models/utils';

export const load = (async ({ locals }) => {
  const uid = locals.user_id!;
  const snapshot = await adminNotificationRef(uid).limit(50).get();
  const notifications: Notification[] = snapshot.docs.map((doc) => makeDocument(doc));
  return {
    notifications
  };
}) satisfies PageServerLoad;

export const actions = {
  rejectInvitation: async ({ request, locals }) => {
    const uid = locals.user_id!;
    const formData = await request.formData();
    const invitation_id = formData.get('invitation_id') as string;
    const organization_id = formData.get('organization_id') as string;
    const notification_id = formData.get('notification_id') as string;

    const inboxRef = adminInboxRef().doc(uid);
    const notificationRef = adminNotificationRef(uid).doc(notification_id);

    const batch = adminDB.batch();
    // Invitation may have been removed before chance to reject
    const invitationDoc = await adminInvitationRef(organization_id).doc(invitation_id).get();
    if (invitationDoc.exists) {
      batch.update(invitationDoc.ref, { rejected: true });
    }
    batch.update(inboxRef, { unread: FieldValue.increment(-1) });
    batch.delete(notificationRef);
    await batch.commit();
  },
  acceptInvitation: async ({ request, locals }) => {
    const uid = locals.user_id!;
    const formData = await request.formData();
    const invitation_id = formData.get('invitation_id') as string;
    const organization_id = formData.get('organization_id') as string;
    const notification_id = formData.get('notification_id') as string;

    const invitationDoc = await adminInvitationRef(organization_id).doc(invitation_id).get();
    if (!invitationDoc.exists) {
      error(401, 'unauthorized');
    }

    const invitation: Invitation = makeDocument(invitationDoc);

    const inboxRef = adminInboxRef().doc(uid);
    const notificationRef = adminNotificationRef(uid).doc(notification_id);

    const profileDoc = await adminProfileRef().doc(uid).get();
    const profile: Profile = makeDocument(profileDoc);

    const membershipProps: MembershipProps = {
      organization_id,
      uid: profile.id,
      standing: 'ok',
      roles: {
        [invitation.group_id]: invitation.role
      }
    };
    const memberProps: MemberProps = {
      uid: profile.id,
      name: profile.name,
      handle: profile.handle,
      role: invitation.role,
      group_id: invitation.group_id,
      organization_id: invitation.organization_id
    };

    const batch = adminDB.batch();
    batch.set(adminMembershipRef(organization_id).doc(invitation.user_id), membershipProps, {
      merge: true
    });
    batch.set(
      adminMemberRef(organization_id, invitation.group_id).doc(invitation.user_id),
      {
        ...memberProps,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    batch.update(inboxRef, { unread: FieldValue.increment(-1) });
    batch.delete(notificationRef);
    batch.delete(invitationDoc.ref);
    await batch.commit();
  }
} satisfies Actions;

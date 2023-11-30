import type { Notification, NotificationProps } from '$lib/models/notifications';
import { adminDB } from '$lib/server/admin';
import { FieldValue, type Timestamp } from 'firebase-admin/firestore';
import type { PageServerLoad } from './$types';
import type { Actions } from '@sveltejs/kit';
import type { Invitation, InvitationProps } from '$lib/models/invitations';
import type { MembershipProps } from '$lib/models/memberships';
import type { MemberProps } from '$lib/models/members';
import type { Profile, ProfileProps } from '$lib/models/profiles';

export const load = (async ({ locals }) => {
  const uid = locals.user_id!;
  const snapshot = await adminDB
    .collection('inboxes')
    .doc(uid)
    .collection('notifications')
    .limit(50)
    .get();
  const notifications: Notification[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as NotificationProps),
    created_at: (doc.data().created_at as Timestamp)?.toDate() ?? new Date()
  }));
  return {
    notifications
  };
}) satisfies PageServerLoad;

export const actions = {
  rejectInvitation: async ({ request }) => {
    const formData = await request.formData();
    const invitation_id = formData.get('invitation_id') as string;
    const organization_id = formData.get('organization_id') as string;
    const notification_id = formData.get('notification_id') as string;
    const invitationDoc = await adminDB
      .collection('organizations')
      .doc(organization_id)
      .collection('invitations')
      .doc(invitation_id)
      .get();
    const invitation: Invitation = {
      id: invitationDoc.id,
      ...(invitationDoc.data() as InvitationProps)
    };

    const inboxRef = adminDB.collection('inboxes').doc(invitation.user_id);
    const notificationRef = adminDB
      .collection('inboxes')
      .doc(invitation.user_id)
      .collection('notifications')
      .doc(notification_id);

    const batch = adminDB.batch();

    batch.update(invitationDoc.ref, { rejected: true });
    batch.update(inboxRef, { unread: FieldValue.increment(-1) });
    batch.delete(notificationRef);
    await batch.commit();
  },
  acceptInvitation: async ({ request }) => {
    const formData = await request.formData();
    const invitation_id = formData.get('invitation_id') as string;
    const organization_id = formData.get('organization_id') as string;
    const notification_id = formData.get('notification_id') as string;

    const invitationDoc = await adminDB
      .collection('organizations')
      .doc(organization_id)
      .collection('invitations')
      .doc(invitation_id)
      .get();
    const invitation: Invitation = {
      id: invitationDoc.id,
      ...(invitationDoc.data() as InvitationProps)
    };

    const inboxRef = adminDB.collection('inboxes').doc(invitation.user_id);
    const notificationRef = adminDB
      .collection('inboxes')
      .doc(invitation.user_id)
      .collection('notifications')
      .doc(notification_id);

    const profileDoc = await adminDB.collection('profiles').doc(invitation.user_id).get();
    const profile: Profile = {
      id: profileDoc.id,
      ...(profileDoc.data() as ProfileProps)
    };

    const membershipProps: MembershipProps = {
      organization_id,
      uid: profile.id,
      standing: 'ok',
      roles: {
        [invitation.workspace_id]: invitation.role
      }
    };
    const memberProps: MemberProps = {
      uid: profile.id,
      name: profile.name,
      handle: profile.handle,
      role: invitation.role,
      workspace_id: invitation.workspace_id,
      organization_id: invitation.organization_id,
      joined_at: new Date()
    };

    const batch = adminDB.batch();
    batch.set(
      adminDB
        .collection('organizations')
        .doc(organization_id)
        .collection('memberships')
        .doc(invitation.user_id),
      membershipProps,
      { merge: true }
    );
    batch.set(
      adminDB
        .collection('organizations')
        .doc(organization_id)
        .collection('workspaces')
        .doc(invitation.workspace_id)
        .collection('members')
        .doc(invitation.user_id),
      {
        ...memberProps,
        joined_at: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    batch.update(inboxRef, { unread: FieldValue.increment(-1) });
    batch.delete(notificationRef);
    batch.delete(invitationDoc.ref);
    await batch.commit();
  }
} satisfies Actions;

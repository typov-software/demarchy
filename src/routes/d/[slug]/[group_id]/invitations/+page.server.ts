import type { RoleAccess } from '$lib/models/roles';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import {
  adminDB,
  adminInboxRef,
  adminInvitationRef,
  adminNotificationRef,
  createdTimestamps,
  updatedTimestamps
} from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { InvitationProps } from '$lib/models/invitations';
import type { NotificationInvitationData, NotificationProps } from '$lib/models/notifications';

export const actions = {
  invite: async ({ request, url }) => {
    const formData = await request.formData();
    const organization_id = formData.get('organization_id') as string;
    const organization_name = formData.get('organization_name') as string;
    const group_id = formData.get('group_id') as string;
    const group_name = formData.get('group_name') as string;
    const user_id = formData.get('user_id') as string;
    const role = (formData.get('role') ?? 'mem') as RoleAccess;
    const created_by = formData.get('created_by') as string;
    const handle = formData.get('handle') as string;
    const profile_handle = formData.get('profile_handle') as string;
    if (!organization_id || !group_id || !user_id || !role || !created_by || !handle) {
      error(401, 'unauthorized');
    }
    const invitationRef = adminInvitationRef(organization_id).doc();
    const batch = adminDB.batch();
    const invitationProps: InvitationProps = {
      user_id: created_by,
      profile_handle,
      invited_profile_handle: handle,
      invited_user_id: user_id,
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
      adminInboxRef().doc(user_id),
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
      group_name
    };
    const notificationProps: NotificationProps = {
      type: 'invitation',
      seen: 0,
      data: inviteData
    };
    batch.create(adminNotificationRef(user_id).doc(), {
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

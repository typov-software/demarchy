import type { RoleAccess } from '$lib/models/roles';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { adminDB } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { InvitationProps } from '$lib/models/invitations';
import type { NotificationInvitationData } from '$lib/models/notifications';

export const actions = {
  invite: async ({ request, url }) => {
    const formData = await request.formData();
    const organization_id = formData.get('organization_id') as string;
    const workspace_id = formData.get('workspace_id') as string;
    const user_id = formData.get('user_id') as string;
    const role = (formData.get('role') ?? 'mem') as RoleAccess;
    const created_by = formData.get('created_by') as string;
    const handle = formData.get('handle') as string;
    if (!organization_id || !workspace_id || !user_id || !role || !created_by || !handle) {
      throw error(401, 'unauthorized');
    }
    const invitation: InvitationProps = {
      created_at: new Date(),
      created_by,
      handle,
      user_id,
      organization_id,
      workspace_id,
      role,
      rejected: false
    };
    const invitationRef = adminDB
      .collection('organizations')
      .doc(organization_id)
      .collection('invitations')
      .doc();

    const batch = adminDB.batch();
    batch.create(invitationRef, {
      ...invitation,
      created_at: FieldValue.serverTimestamp()
    });
    batch.set(
      adminDB.collection('inboxes').doc(user_id),
      {
        unread: FieldValue.increment(1)
      },
      {
        merge: true
      }
    );
    batch.create(adminDB.collection('inboxes').doc(user_id).collection('notifications').doc(), {
      created_at: FieldValue.serverTimestamp(),
      type: 'invitation',
      read: false,
      data: {
        invitation_id: invitationRef.id,
        organization_id,
        workspace_id
      } as NotificationInvitationData
    });
    await batch.commit();

    throw redirect(303, url.pathname);
  },

  uninvite: async ({ request }) => {
    const formData = await request.formData();
    const organization_id = formData.get('organization_id') as string;
    const invitation_id = formData.get('invitation_id') as string;
    await adminDB
      .collection('organizations')
      .doc(organization_id)
      .collection('invitations')
      .doc(invitation_id)
      .delete();
    return {};
  }
} satisfies Actions;

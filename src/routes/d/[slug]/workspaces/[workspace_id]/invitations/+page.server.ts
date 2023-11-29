import type { RoleAccess } from '$lib/models/roles';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { adminDB } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { InvitationProps } from '$lib/models/invitations';

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
      role
    };
    await adminDB
      .collection('organizations')
      .doc(organization_id)
      .collection('invitations')
      .add({
        ...invitation,
        created_at: FieldValue.serverTimestamp()
      });

    throw redirect(303, url.pathname);
  }
} satisfies Actions;

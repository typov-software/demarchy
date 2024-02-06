import _set from 'lodash/set';
import type { Actions, PageServerLoad } from './$types';
import {
  adminDB,
  adminGroupApplicationRef,
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
import type { Invitation } from '$lib/models/invitations';
import type { NotificationProps, UninviteNotificationData } from '$lib/models/notifications';
import type { Application } from '$lib/models/applications';
import { addDays } from 'date-fns';
import { resendInvitation, sendInvitation } from '$lib/server/invitation-actions';

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

  const applicationsSnapshot = await adminDB
    .doc(group.path)
    .collection('applications')
    .where('created_at', '>=', addDays(new Date(), -7))
    .get();

  const members: Member[] = snapshot.docs.map((doc) => makeDocument(doc));
  const invitations: Invitation[] = invitationsSnapshot.docs.map((doc) => makeDocument(doc));
  const applications: Application[] = applicationsSnapshot.docs.map((doc) => makeDocument(doc));

  return {
    members,
    invitations,
    applications
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

  sendInvitations: async ({ request, url }) => {
    const formData = await request.formData();
    const entries = Array.from(formData.entries());
    const organization_id = formData.get('organization_id') as string;
    const organization_name = formData.get('organization_name') as string;
    const group_id = formData.get('group_id') as string;
    const group_name = formData.get('group_name') as string;
    const user_id = formData.get('user_id') as string;
    const profile_handle = formData.get('profile_handle') as string;
    if (!organization_id || !group_id || !user_id || !profile_handle) {
      error(401, 'unauthorized');
    }
    const inviteMap: Record<string, Record<string, string>> = {};
    for (const [key, value] of entries) {
      if (!key.startsWith('invitee-')) {
        continue;
      }
      const handle = /invitee-(.*)\[/.exec(key)?.at(1);
      const type = /\[(.*)\]/.exec(key)?.at(1);
      _set(inviteMap, `${handle}.${type}`, value);
    }

    const handles = Object.keys(inviteMap);
    const failures: { id: string; handle: string; reason: string }[] = [];
    for (const key of handles) {
      const pair = inviteMap[key];
      const invitee = {
        id: pair.id,
        handle: pair.handle
      };
      if (!invitee.id || !invitee.handle) {
        // invalid entry
        failures.push({
          id: pair.id,
          handle: pair.handle,
          reason: 'invalid'
        });
        continue;
      }

      const result = await sendInvitation({
        organization_id,
        organization_name,
        group_id,
        group_name,
        invited_user_id: invitee.id,
        invited_profile_handle: invitee.handle,
        user_id,
        profile_handle,
        role: 'mem'
      });

      if (result !== 'sent') {
        failures.push({
          ...invitee,
          reason: result
        });
      }
    }

    if (failures.length) {
      console.log({ failures });
    }

    redirect(301, url.pathname);
  },

  uninvite: async ({ request }) => {
    const formData = await request.formData();
    const organization_id = formData.get('organization_id') as string;
    const organization_name = formData.get('organization_name') as string;
    const group_id = formData.get('group_id') as string;
    const group_name = formData.get('group_name') as string;
    const invitation_id = formData.get('invitation_id') as string;
    const invitationRef = adminInvitationRef(organization_id).doc(invitation_id);
    const invitationDoc = await invitationRef.get();
    const invitation = makeDocument<Invitation>(invitationDoc);
    const notificationData: UninviteNotificationData = {
      invitation_id,
      organization_id,
      organization_name,
      group_id,
      group_name
    };
    const notificationProps: NotificationProps = {
      type: 'uninvite',
      seen: 0,
      data: notificationData
    };
    const batch = adminDB.batch();
    batch.create(adminNotificationRef(invitation.invited_user_id).doc(), {
      ...createdTimestamps(),
      ...notificationProps
    });
    batch.set(
      adminInboxRef().doc(invitation.invited_user_id),
      {
        ...updatedTimestamps(),
        unread: FieldValue.increment(1)
      },
      {
        merge: true
      }
    );
    batch.delete(invitationRef);
    await batch.commit();
    return {};
  },

  resend: async ({ request }) => {
    const formData = await request.formData();
    const invitation_path = formData.get('invitation_path') as string;
    const result = await resendInvitation({ invitation_path });
    if (result !== 'sent') {
      console.error(`Failed to resend invitation: ${result}`);
    }
  },

  acceptApplication: async ({ request, locals }) => {
    const user_id = locals.user_id!;
    const formData = await request.formData();
    const application_id = formData.get('application_id') as string;
    const organization_id = formData.get('organization_id') as string;
    const organization_name = formData.get('organization_name') as string;
    const group_id = formData.get('group_id') as string;
    const group_name = formData.get('group_name') as string;
    const profile_handle = formData.get('profile_handle') as string;

    const applicationDoc = await adminGroupApplicationRef(organization_id, group_id)
      .doc(application_id)
      .get();
    const application = makeDocument<Application>(applicationDoc);
    // Check for missing application or unexpected form input
    if (
      !applicationDoc.exists ||
      application.organization_id !== organization_id ||
      application.group_id !== group_id
    ) {
      error(401, 'Missing application');
    }

    const result = await sendInvitation({
      organization_id,
      organization_name,
      group_id,
      group_name,
      invited_user_id: application.user_id,
      invited_profile_handle: application.profile_handle,
      user_id,
      profile_handle,
      role: 'mem'
    });

    if (result !== 'sent') {
      console.error(`Failed to resend invitation: ${result}`);
    } else {
      await applicationDoc.ref.delete();
    }
  }
} satisfies Actions;

import { type Invitation, type InvitationProps } from '$lib/models/invitations';
import {
  adminDB,
  adminGroupRef,
  adminInvitationRef,
  adminOrganizationRef,
  createdTimestamps,
} from './admin';
import type { InvitationNotificationData, NotificationProps } from '$lib/models/notifications';
import { makeDocument } from '$lib/models/utils';
import type { Group } from '$lib/models/groups';
import type { Organization } from '$lib/models/organizations';
import { prepareNotification } from './notification-actions';

export interface SendInvitationParams extends Omit<InvitationProps, 'rejected'> {
  organization_name: string;
  group_name: string;
}

export async function sendInvitation(
  params: SendInvitationParams,
): Promise<'duplicate' | 'unauthorized' | 'sent'> {
  const {
    organization_id,
    group_id,
    invited_user_id,
    invited_profile_handle,
    role,
    organization_name,
    group_name,
    user_id,
    profile_handle,
  } = params;

  const existingInvitationSnapshot = await adminInvitationRef(organization_id)
    .where('invited_user_id', '==', invited_user_id)
    .get();
  if (existingInvitationSnapshot.docs.length) {
    return 'duplicate';
  }

  const invitationRef = adminInvitationRef(organization_id).doc();
  const invitationProps: InvitationProps = {
    user_id,
    profile_handle,
    invited_profile_handle,
    invited_user_id,
    organization_id,
    group_id,
    role,
    rejected: false,
  };
  const inviteData: InvitationNotificationData = {
    invitation_id: invitationRef.id,
    organization_id,
    organization_name,
    group_id,
    group_name,
    invited_by_id: user_id,
    invited_by_handle: profile_handle,
  };
  const notificationProps: NotificationProps = {
    category: 'invitations',
    type: 'invitation',
    seen: 0,
    data: inviteData,
  };

  const batch = adminDB.batch();
  batch.create(invitationRef, {
    ...createdTimestamps(),
    ...invitationProps,
  });
  prepareNotification(notificationProps, invited_user_id, batch);
  try {
    await batch.commit();
  } catch (e) {
    console.error(e);
    return 'unauthorized';
  }
  return 'sent';
}

interface ResendInvitationParams {
  invitation_path: string;
}

export async function resendInvitation(
  params: ResendInvitationParams,
): Promise<'unauthorized' | 'sent'> {
  const { invitation_path } = params;
  const invitationDoc = await adminDB.doc(invitation_path).get();
  if (!invitationDoc.exists) {
    return 'unauthorized';
  }
  const invitation = makeDocument<Invitation>(invitationDoc);
  const organizationDoc = await adminOrganizationRef().doc(invitation.organization_id).get();
  const groupDoc = await adminGroupRef(invitation.organization_id).doc(invitation.group_id).get();
  if (!organizationDoc.exists || !groupDoc.exists) {
    return 'unauthorized';
  }
  const organization = makeDocument<Organization>(organizationDoc);
  const group = makeDocument<Group>(groupDoc);
  const inviteData: InvitationNotificationData = {
    invitation_id: invitation.id,
    organization_id: invitation.organization_id,
    organization_name: organization.name,
    group_id: invitation.group_id,
    group_name: group.name,
    invited_by_id: invitation.user_id,
    invited_by_handle: invitation.profile_handle,
  };
  const notificationProps: NotificationProps = {
    category: 'invitations',
    type: 'invitation',
    seen: 0,
    data: inviteData,
  };

  const batch = adminDB.batch();
  prepareNotification(notificationProps, invitation.invited_user_id, batch);
  try {
    await batch.commit();
  } catch (e) {
    console.error(e);
    return 'unauthorized';
  }
  return 'sent';
}

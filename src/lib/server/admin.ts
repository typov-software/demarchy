import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { FB_CLIENT_EMAIL, FB_PRIVATE_KEY, FB_PROJECT_ID } from '$env/static/private';
import pkg from 'firebase-admin';
import {
  HANDLES,
  INBOXES,
  INVITATIONS,
  MEMBERS,
  MEMBERSHIPS,
  NOTIFICATIONS,
  ORGANIZATIONS,
  PROFILES,
  SLUGS,
  VOUCHERS,
  WORKSPACES
} from '$lib/models/firestore';

try {
  pkg.initializeApp({
    credential: pkg.credential.cert({
      projectId: FB_PROJECT_ID,
      clientEmail: FB_CLIENT_EMAIL,
      privateKey: atob(FB_PRIVATE_KEY)
    })
  });
} catch (err: unknown) {
  const error = err as Error;
  if (!/already exists/u.test(error.message)) {
    console.error('Firebase Admin Error: ', error.stack);
  }
}

export const adminDB = getFirestore();
export const adminAuth = getAuth();

export function adminInboxRef() {
  return adminDB.collection(INBOXES);
}

export function adminNotificationRef(inbox_id: string) {
  return adminInboxRef().doc(inbox_id).collection(NOTIFICATIONS);
}

export function adminProfileRef() {
  return adminDB.collection(PROFILES);
}

export function adminHandleRef() {
  return adminDB.collection(HANDLES);
}

export function adminSlugRef() {
  return adminDB.collection(SLUGS);
}

export function adminVoucherRef() {
  return adminDB.collection(VOUCHERS);
}

export function adminOrganizationRef() {
  return adminDB.collection(ORGANIZATIONS);
}

export function adminWorkspaceRef(organization_id: string) {
  return adminOrganizationRef().doc(organization_id).collection(WORKSPACES);
}

export function adminMemberRef(organization_id: string, workspace_id: string) {
  return adminWorkspaceRef(organization_id).doc(workspace_id).collection(MEMBERS);
}

export function adminInvitationRef(organization_id: string) {
  return adminOrganizationRef().doc(organization_id).collection(INVITATIONS);
}

export function adminMembershipRef(organization_id: string) {
  return adminOrganizationRef().doc(organization_id).collection(MEMBERSHIPS);
}

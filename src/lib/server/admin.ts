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
  GROUPS,
  FEEDBACK
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

export function adminGroupRef(organization_id: string) {
  return adminOrganizationRef().doc(organization_id).collection(GROUPS);
}

export function adminMemberRef(organization_id: string, group_id: string) {
  return adminGroupRef(organization_id).doc(group_id).collection(MEMBERS);
}

export function adminGroupFeedbackRef(organization_id: string, group_id: string) {
  return adminGroupRef(organization_id).doc(group_id).collection(FEEDBACK);
}

export function adminInvitationRef(organization_id: string) {
  return adminOrganizationRef().doc(organization_id).collection(INVITATIONS);
}

export function adminMembershipRef(organization_id: string) {
  return adminOrganizationRef().doc(organization_id).collection(MEMBERSHIPS);
}

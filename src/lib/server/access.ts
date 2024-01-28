import type { MembershipProps } from '$lib/models/memberships';
import type { RoleAccess } from '$lib/models/roles';
import { error } from '@sveltejs/kit';
import { adminDB, adminMembershipRef } from './admin';

export interface MembershipInfo {
  standing: MembershipProps['standing'];
  roles: MembershipProps['roles'];
}

export async function getMembershipInfo(
  organization_id: string,
  user_id: string
): Promise<MembershipInfo> {
  const doc = await adminMembershipRef(organization_id).doc(user_id).get();
  return {
    standing: doc.data()?.standing ?? 'pause',
    roles: doc.data()?.roles ?? {}
  };
}

/**
 * Checks the access level for a given user and group id
 * @param group_id Group ID
 * @param levels Array of access levels needed for resource
 * @param info Membership access information derived from Membership document
 * @returns Whether the user has proper access
 */
export function verifyRoles(group_id: string, levels: RoleAccess[], info: MembershipInfo) {
  return info.standing === 'ok' && levels.includes(info.roles[group_id]);
}

/**
 * Checks if a user can read and organization
 * @param organization_id Organization ID
 * @param user_id User ID
 * @param info Membership access information derived from Membership document
 * @returns Whether the user can read an org
 */
export async function canReadOrg(organization_id: string, user_id: string, info?: MembershipInfo) {
  info = info ? info : await getMembershipInfo(organization_id, user_id);
  return verifyRoles(organization_id, ['obs', 'mem', 'mod', 'adm'], info);
}

/**
 * Checks whether a user has access to an organization
 * @param organization_id Organization ID
 * @param user_id User ID
 * @param info Membership access information derived from Membership document
 * @returns Whether the user is a member or higher of an org
 */
export async function isOrgMemberOrHigher(
  organization_id: string,
  user_id: string,
  info?: MembershipInfo
) {
  info = info ? info : await getMembershipInfo(organization_id, user_id);
  return verifyRoles(organization_id, ['mem', 'mod', 'adm'], info);
}

/**
 * Checks whether a user has access to a group
 * @param organization_id Organization ID
 * @param group_id Group ID
 * @param user_id User ID
 * @param info Membership access information derived from Membership document
 * @returns Whether the user is a observer or higher of a group
 */
export async function isGroupObserverOrHigher(
  organization_id: string,
  group_id: string,
  user_id: string,
  info?: MembershipInfo
) {
  info = info ? info : await getMembershipInfo(organization_id, user_id);
  const org = verifyRoles(organization_id, ['obs', 'mem', 'mod', 'adm'], info);
  const group = verifyRoles(group_id, ['obs', 'mem', 'mod', 'adm'], info);
  return org && group;
}

/**
 * Checks whether a user is a member or higher of a group.
 * @param organization_id Organization ID
 * @param group_id Group ID
 * @param user_id User ID
 * @param info Membership access information derived from Membership document
 * @returns Whether the user is a member or higher of a group
 */
export async function isGroupMemberOrHigher(
  organization_id: string,
  group_id: string,
  user_id: string,
  info?: MembershipInfo
) {
  info = info ? info : await getMembershipInfo(organization_id, user_id);
  const org = verifyRoles(organization_id, ['mem', 'mod', 'adm'], info);
  const group = verifyRoles(group_id, ['mem', 'mod', 'adm'], info);
  return org && group;
}

/**
 * Checks whether a user is an admin of a group
 * @param organization_id Organization ID
 * @param group_id Group ID
 * @param user_id User ID
 * @param info Membership access information derived from Membership document
 * @returns Whether the user is an admin of a group
 */
export async function isGroupAdmin(
  organization_id: string,
  group_id: string,
  user_id: string,
  info?: MembershipInfo
) {
  info = info ? info : await getMembershipInfo(organization_id, user_id);
  const org = verifyRoles(organization_id, ['mem', 'mod', 'adm'], info);
  const group = verifyRoles(group_id, ['adm'], info);
  return org && group;
}

/**
 * Ensures a document exists at a path and optionally is owned by a given user.
 * @param path Firestore document path
 * @param userId Optional owner id
 * @returns The verified document
 */
export async function verifyDocument(path: string, userId?: string) {
  if (!path) {
    // ensure form has not been tampered with
    error(403, 'unauthorized');
  }
  const doc = await adminDB.doc(path).get();
  if (!doc.exists) {
    // proposal must exist, sanity check
    error(403, 'unauthorized');
  }
  if (userId) {
    const data = doc.data() ?? {};
    if (!data.user_id || data.user_id !== userId) {
      error(403, 'unauthorized');
    }
  }
  return doc;
}

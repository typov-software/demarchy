import type { MembershipProps } from '$lib/models/memberships';
import type { RoleAccess } from '$lib/models/roles';
import { adminMembershipRef } from './admin';

export interface MembershipInfo {
  standing: MembershipProps['standing'];
  roles: MembershipProps['roles'];
}

export async function getMembershipInfo(oid: string, uid: string): Promise<MembershipInfo> {
  const doc = await adminMembershipRef(oid).doc(uid).get();
  return {
    standing: doc.data()?.standing ?? 'pause',
    roles: doc.data()?.roles ?? {}
  };
}

/**
 * Checks the access level for a given user and group id
 * @param gid Group ID
 * @param levels Array of access levels needed for resource
 * @param info Membership access information derived from Membership document
 * @returns Whether the user has proper access
 */
export function verifyRoles(gid: string, levels: RoleAccess[], info: MembershipInfo) {
  return info.standing === 'ok' && levels.includes(info.roles[gid]);
}

/**
 * Checks if a user can read and organization
 * @param oid Organization ID
 * @param uid User ID
 * @param info Membership access information derived from Membership document
 * @returns Whether the user can read an org
 */
export async function canReadOrg(oid: string, uid: string, info?: MembershipInfo) {
  info = info ? info : await getMembershipInfo(oid, uid);
  return verifyRoles(oid, ['obs', 'mem', 'mod', 'adm'], info);
}

/**
 * Checks whether a user has access to an organization
 * @param oid Organization ID
 * @param uid User ID
 * @param info Membership access information derived from Membership document
 * @returns Whether the user is a member or higher of an org
 */
export async function isOrgMemberOrHigher(oid: string, uid: string, info?: MembershipInfo) {
  info = info ? info : await getMembershipInfo(oid, uid);
  return verifyRoles(oid, ['mem', 'mod', 'adm'], info);
}

/**
 * Checks whether a user has access to a group
 * @param oid Organization ID
 * @param gid Group ID
 * @param uid User ID
 * @param info Membership access information derived from Membership document
 * @returns Whether the user is a observer or higher of a group
 */
export async function isGroupObserverOrHigher(
  oid: string,
  gid: string,
  uid: string,
  info?: MembershipInfo
) {
  info = info ? info : await getMembershipInfo(oid, uid);
  const org = verifyRoles(oid, ['obs', 'mem', 'mod', 'adm'], info);
  const group = verifyRoles(gid, ['obs', 'mem', 'mod', 'adm'], info);
  return org && group;
}

/**
 * Checks whether a user is a member or higher of a group.
 * @param oid Organization ID
 * @param gid Group ID
 * @param uid User ID
 * @param info Membership access information derived from Membership document
 * @returns Whether the user is a member or higher of a group
 */
export async function isGroupMemberOrHigher(
  oid: string,
  gid: string,
  uid: string,
  info?: MembershipInfo
) {
  info = info ? info : await getMembershipInfo(oid, uid);
  const org = verifyRoles(oid, ['mem', 'mod', 'adm'], info);
  const group = verifyRoles(gid, ['mem', 'mod', 'adm'], info);
  return org && group;
}

export async function isGroupAdmin(oid: string, gid: string, uid: string, info?: MembershipInfo) {
  info = info ? info : await getMembershipInfo(oid, uid);
  const org = verifyRoles(oid, ['mem', 'mod', 'adm'], info);
  const group = verifyRoles(gid, ['adm'], info);
  return org && group;
}

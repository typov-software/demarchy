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

export function verifyRoles(wid: string, levels: RoleAccess[], info: MembershipInfo) {
  return info.standing === 'ok' && levels.includes(info.roles[wid]);
}

export async function canReadOrg(oid: string, uid: string, info?: MembershipInfo) {
  info = info ? info : await getMembershipInfo(oid, uid);
  return verifyRoles(oid, ['obs', 'mem', 'mod', 'adm'], info);
}

export async function isOrgMemberOrHigher(oid: string, uid: string, info?: MembershipInfo) {
  info = info ? info : await getMembershipInfo(oid, uid);
  return verifyRoles(oid, ['mem', 'mod', 'adm'], info);
}

export async function isGroupObserverOrHigher(
  oid: string,
  wid: string,
  uid: string,
  info?: MembershipInfo
) {
  info = info ? info : await getMembershipInfo(oid, uid);
  const org = verifyRoles(oid, ['obs', 'mem', 'mod', 'adm'], info);
  const ws = verifyRoles(wid, ['obs', 'mem', 'mod', 'adm'], info);
  return org && ws;
}

export async function isGroupMemberOrHigher(
  oid: string,
  wid: string,
  uid: string,
  info?: MembershipInfo
) {
  info = info ? info : await getMembershipInfo(oid, uid);
  const org = verifyRoles(oid, ['mem', 'mod', 'adm'], info);
  const ws = verifyRoles(wid, ['mem', 'mod', 'adm'], info);
  return org && ws;
}

export async function isGroupAdmin(oid: string, wid: string, uid: string, info?: MembershipInfo) {
  info = info ? info : await getMembershipInfo(oid, uid);
  const org = verifyRoles(oid, ['mem', 'mod', 'adm'], info);
  const ws = verifyRoles(wid, ['adm'], info);
  return org && ws;
}

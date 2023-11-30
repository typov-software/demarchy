import type { MembershipProps } from '$lib/models/memberships';
import type { RoleAccess } from '$lib/models/roles';
import { adminDB } from './admin';

export interface MembershipInfo {
  standing: MembershipProps['standing'];
  roles: MembershipProps['roles'];
}

export async function getMembershipInfo(oid: string, uid: string): Promise<MembershipInfo> {
  const doc = await adminDB
    .collection('organizations')
    .doc(oid)
    .collection('memberships')
    .doc(uid)
    .get();
  return {
    standing: doc.data()?.standing ?? 'pause',
    roles: doc.data()?.roles ?? {}
  };
}

export function verifyRoles(wid: string, levels: RoleAccess[], info: MembershipInfo) {
  return info.standing === 'ok' && info.roles[wid] in levels;
}

export async function canReadOrg(oid: string, uid: string) {
  return verifyRoles(oid, ['obs', 'mem', 'mod', 'adm'], await getMembershipInfo(oid, uid));
}

export async function isOrgMemberOrHigher(oid: string, uid: string) {
  return verifyRoles(oid, ['mem', 'mod', 'adm'], await getMembershipInfo(oid, uid));
}

export async function isWorkspaceMemberOrHigher(oid: string, wid: string, uid: string) {
  const info = await getMembershipInfo(oid, uid);
  const org = verifyRoles(oid, ['mem', 'mod', 'adm'], info);
  const ws = verifyRoles(wid, ['mem', 'mod', 'adm'], info);
  return org && ws;
}

export async function isWorkspaceAdmin(oid: string, wid: string, uid: string) {
  const info = await getMembershipInfo(oid, uid);
  const org = verifyRoles(oid, ['mem', 'mod', 'adm'], info);
  const ws = verifyRoles(wid, ['adm'], info);
  return org && ws;
}

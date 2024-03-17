export type RoleAccess = 'obs' | 'mem' | 'mod' | 'adm';

const roleNameMap: Record<RoleAccess, string> = {
  obs: 'Observer',
  mem: 'Member',
  mod: 'Moderator',
  adm: 'Admin'
};

export function getRoleName(role: RoleAccess) {
  return roleNameMap[role] ?? 'No access';
}

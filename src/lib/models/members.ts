import type { RoleAccess } from './roles';
import type { WithId } from './utils';

/**
 * This document type belongs to a members collection on a group document.
 * When a member's role is changed, the corresponding membership document must
 * also be updated.
 */
export interface MemberProps {
  uid: string;
  organization_id: string;
  group_id: string;
  role: RoleAccess;
  joined_at: Date;
  // TODO: name and handle need to be updated when a user info changes
  // this doesnt need to be a cloud function, it could be an api endpoint or
  // cloud task triggered by a user action.
  name: string;
  handle: string;
}

export type Member = MemberProps & WithId;

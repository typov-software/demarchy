import type { RoleAccess } from './roles';
import type { WithId } from './utils';

/**
 * The `id` for this document is a Firebase User id. This document is only
 * managed from an admin sdk context, as it reflects data controlled by workspace
 * members.
 */
export interface MembershipProps {
  /**
   * user id represented in this membership, useful for collection group queries
   */
  uid: string;

  /**
   * A record of roles by id. The id could be the organization id, group id, or user id.
   */
  roles: Record<string, RoleAccess>;

  /**
   * A membership standing accounts for the fees due for each organization member. Members have
   * full access on 'ok' and have reduced privileges on 'pause'.
   */
  standing: 'ok' | 'pause';
}

export type Membership = MembershipProps & WithId;

import type { RoleAccess } from './roles';
import type { WithRef } from './utils';

export interface InvitationProps {
  organization_id: string;
  group_id: string;
  user_id: string;
  handle: string;
  role: RoleAccess;
  rejected: boolean;
  created_by: string;
  created_at: Date;
}

export type Invitation = InvitationProps & WithRef;

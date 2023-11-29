import type { RoleAccess } from './roles';
import type { WithId } from './utils';

export interface InvitationProps {
  organization_id: string;
  workspace_id: string;
  user_id: string;
  handle: string;
  role: RoleAccess;
  created_by: string;
  created_at: Date;
}

export type Invitation = InvitationProps & WithId;

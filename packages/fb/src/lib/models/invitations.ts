import type { RoleAccess } from "./roles";
import type { DocumentMeta } from "./utils";

export interface InvitationProps {
  organization_id: string;
  group_id: string;
  invited_user_id: string;
  invited_profile_handle: string;
  role: RoleAccess;
  rejected: boolean;
  user_id: string;
  profile_handle: string;
}

export type Invitation = InvitationProps & DocumentMeta;

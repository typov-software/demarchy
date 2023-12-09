import type { WithId } from './utils';

/**
 * Demarchy organizations are made up of many groups -- including one for the org and one
 * per org member. Other groups can be created by organization members and joined at will.
 * Members can apply for groups, which are voted on by group members.
 */
export interface GroupProps {
  name: string;
  description: string;
  // latest published library id
  library_id: string | null;
  organization_id: string;
  created_at: Date;
  created_by: string;
}

export type Group = GroupProps & WithId;

import type { DocumentMeta } from './utils';

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
  user_id: string;

  member_count: number;
}

export type Group = GroupProps & DocumentMeta;

import type { WithId } from './utils';

/**
 * Demarchy organizations are made up of many workspaces -- including one for the org and one
 * per org member. Other workspaces can be created by organization members and joined at will.
 * Members can apply for workspaces, which are voted on by workspace members.
 */
export interface WorkspaceProps {
  name: string;
  description: string;
  // latest published library id
  library_id: string | null;
}

export type Workspace = WorkspaceProps & WithId;

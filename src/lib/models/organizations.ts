import type { WorkspaceProps } from './workspaces';
import type { WithId } from './utils';

export interface OrganizationProps extends WorkspaceProps {}

export type Organization = OrganizationProps & WithId;

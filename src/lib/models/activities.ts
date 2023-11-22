import type { WithId } from './utils';

export type ActivityType = 'proposal_opened' | 'proposal_adopted' | 'proposal_rejected';

export interface ActivityProps {
  workspace_id: string;
  type: ActivityType;
}

export type Activity = ActivityProps & WithId;
